import { z } from 'zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';
import { useBatchQueryData } from './use-batch-query-data';
import { ROUTES } from '@/router';
import { useParsedPagination } from '@/hooks/use-parsed-pagination';
import { TEntryProcessorTypes } from '@/interfaces/data-batch';

const acceptedTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const FormSchema = z.object({
  type: z.string().min(1, 'Please select the target service.'),
  companyId: z.string(),
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
});

type FormData = z.infer<typeof FormSchema>;

export const useBatchForm = () => {
  const [batch] = useBatchQueryData();

  let defaultValues: FormData = {
    type: '',
    companyId: 'm-p',
    dataFile: null,
  };

  if (batch) {
    defaultValues = {
      ...defaultValues,
      type: String(
        [
          TEntryProcessorTypes.LedgerCashOutEntry_1,
          TEntryProcessorTypes.LedgerCashOutEntry_2,
          TEntryProcessorTypes.LedgerCashOutEntry_3,
        ].includes(batch?.entryProcessorType ?? '')
          ? String(TEntryProcessorTypes.LedgerCashOutEntry_1)
          : ''
      ),
    };
  }

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const [uploadProgress, setUploadProgress] = useState(0);

  const { ledger, dataBatch } = useServices();

  const defaultPagination = useParsedPagination();

  const {
    mutateAsync: startUpload,
    isPending,
    dismissLoading,
  } = useMutation({
    mutationKey: ledger.mutationKey,
    operationName: 'upload',
    mutationFn: ledger.upload,
    formControl: form.control,
    refetchQueries: [
      [...dataBatch.getQueryKey('cashManagement', defaultPagination)],
    ],
  });

  const navigate = useNavigate();

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
        navigate({
          to: ROUTES.DASHBOARD.CASH_MANAGEMENT.HOME,
          ...(Array.isArray(data) && {
            search: { batchNumberIds: JSON.stringify(data) },
          }),
        });
      });
    },
    [startUpload, navigate, dismissLoading]
  );

  return {
    form: {
      ...form,
      uploadProgress,
      isDisabled,
      onSubmit: form.handleSubmit(onSubmit),
    },
  };
};
