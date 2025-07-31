import { z } from 'zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';
import { useBatchQueryData } from './use-batch-query-data';
import { ROUTES } from '@/router';
import { AccountReceivable } from '@/services/api/account-receivable';

const acceptedTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const FormSchema = z
  .object({
    type: z.string().min(1, 'Please select the target service.'),
    companyId: z.string(),
    billingCodeId: z.string().optional(),
    dataFile: z.custom<File[] | null>().superRefine((value, ctx) => {
      if (!value || value.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please select a file.',
        });

        return;
      }

      if (!acceptedTypes.includes(value?.[0].type)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please select a valid file type (Excel).',
        });
      }
    }),
  })
  .superRefine((data, ctx) => {
    const type = Number(data.type);
    const billingCode = data.billingCodeId;
    const isBillingCodeRequired =
      !AccountReceivable.getInstance().isCreditNote(type);

    if (isBillingCodeRequired && (!billingCode || billingCode.trim() === '')) {
      ctx.addIssue({
        path: ['billingCodeId'],
        code: 'custom',
        message: 'Please select the target service billing classification.',
      });
    }
  });

type FormData = z.infer<typeof FormSchema>;

export const useBatchForm = () => {
  const [batch, setBatch] = useBatchQueryData();

  let defaultValues: FormData = {
    type: '',
    companyId: 'm-p',
    billingCodeId: '',
    dataFile: null,
  };

  if (batch) {
    defaultValues = {
      ...defaultValues,
      type: String(batch?.entryProcessorType ?? ''),
      billingCodeId: String(batch?.billingCodeId ?? ''),
    };
  }

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const [uploadProgress, setUploadProgress] = useState(0);

  const [billingCodeKey, setBillingCodeKey] = useState(crypto.randomUUID());

  const { accountReceivable } = useServices();

  const {
    mutateAsync: startUpload,
    isPending,
    dismissLoading,
  } = useMutation({
    mutationKey: accountReceivable.mutationKey,
    operationName: 'upload',
    mutationFn: accountReceivable.upload,
    formControl: form.control,
  });

  const navigate = useNavigate();

  const type = form.watch('type');

  const isBillingCodeDisabled = useMemo(
    () => accountReceivable.isCreditNote(type),
    [type, accountReceivable]
  );

  const isDisabled = useMemo(() => {
    const isSuccess = batch && batch.totalFormattedCount > 0;
    return isSuccess || isPending;
  }, [batch, isPending]);

  const onSubmit = useCallback(
    (values: FormData) => {
      const files = values.dataFile!;

      const options = {
        data: {
          companyId: values.companyId,
          billingCodeId: values.billingCodeId,
          dataFile: files[0],
        },
        type: values.type,
        uploadProgress: (prog: number) => {
          const uploadComplete = prog === 100;
          if (uploadComplete) {
            dismissLoading(toast.loading('Data is being processed'));
          }
          setUploadProgress(prog);
        },
      };

      startUpload(options).then((data) => {
        setBatch(data);
        navigate({
          to: ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.BATCH.VIEW,
          params: { batchId: data.id },
        });
      });
    },
    [startUpload, navigate, setBatch, dismissLoading]
  );

  useEffect(() => {
    if (!type) return;
    form.resetField('billingCodeId');
    setBillingCodeKey(crypto.randomUUID());
  }, [type, form]);

  return {
    form: {
      ...form,
      uploadProgress,
      billingCodeKey,
      isBillingCodeDisabled,
      isDisabled,
      onSubmit: form.handleSubmit(onSubmit),
    },
  };
};
