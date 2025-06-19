import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';
import { useState } from 'react';
import { useUploadEntriesStore } from './use-upload-entries-store';

const acceptedTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const FormSchema = z.object({
  type: z.string().min(1, 'Please select the type of entry.'),
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

export const useUploadEntries = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: '',
      companyId: 'm-p',
      billingCodeId: '',
      dataFile: null,
    },
  });

  const [uploadProgress, setUploadProgress] = useState(0);

  const { accountReceivable } = useServices();

  const { mutateAsync: startUpload, isPending } = useMutation({
    mutationKey: [accountReceivable.mutationKey],
    operationName: 'upload',
    mutationFn: accountReceivable.upload,
    formControl: form.control,
  });

  const setEnteries = useUploadEntriesStore((s) => s.setDataBatch);

  const onSubmit = (values: FormData) => {
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

    startUpload(options).then(setEnteries);
  };

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
