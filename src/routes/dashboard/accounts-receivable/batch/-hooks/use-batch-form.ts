import { z } from 'zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';

import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';
import { useBatchQueryData } from './use-batch-query-data';
import { ROUTES } from '@/router';

const acceptedTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const FormSchema = z.object({
  type: z.string().min(1, 'Please select the target service.'),
  companyId: z.string(),
  billingCodeId: z
    .string()
    .min(1, 'Please select the target service billing classification.'),
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
      type: String(batch?.targetService ?? ''),
      billingCodeId: String(batch?.billingClassificationCode ?? ''),
    };
  }

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const [uploadProgress, setUploadProgress] = useState(0);

  const { accountReceivable } = useServices();

  const { mutateAsync: startUpload, isPending } = useMutation({
    mutationKey: [accountReceivable.mutationKey],
    operationName: 'upload',
    mutationFn: accountReceivable.upload,
    formControl: form.control,
  });

  const navigate = useNavigate();

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
        uploadProgress: (prog: number) => setUploadProgress(prog),
      };

      startUpload(options).then((data) => {
        setBatch(data);
        navigate({
          to: ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.BATCH,
          search: { batchId: data.id },
        });
      });
    },
    [startUpload, navigate, setBatch]
  );

  return {
    form: {
      ...form,
      isPending,
      uploadProgress,
      onSubmit: form.handleSubmit(onSubmit),
    },
    UPLOAD_TYPES: accountReceivable.UPLOAD_TYPES,
  };
};
