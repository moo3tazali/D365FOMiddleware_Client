import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';

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

export const useUploadEnteries = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: '',
      companyId: 'm-p',
      billingCodeId: '',
      dataFile: null,
    },
  });

  const { accountReceivable } = useServices();

  const { mutate, isPending } = useMutation({
    operationName: 'upload Entries',
    mutationFn: accountReceivable.upload,
    formControl: form.control,
  });

  const onSubmit = (values: FormData) => {
    const files = values.dataFile!;

    const options = {
      data: {
        companyId: values.companyId,
        billingCodeId: values.billingCodeId,
        dataFile: files[0],
      },
      type: values.type,
    };

    mutate(options);
  };

  return {
    form: {
      ...form,
      isPending,
      onSubmit: form.handleSubmit(onSubmit),
    },
    UPLOAD_TYPES: accountReceivable.UPLOAD_TYPES,
  };
};
