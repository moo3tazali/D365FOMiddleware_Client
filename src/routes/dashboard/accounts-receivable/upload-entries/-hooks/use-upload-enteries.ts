import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface Payload {
  companyId: string;
  billingCodeId: string;
  dataFile: File;
}

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

  const onFreightUpload = (payload: Payload) => {
    // TODO: Implement
    console.log('onFreightUpload', payload);
  };

  const onTruckingUpload = (payload: Payload) => {
    // TODO: Implement
    console.log('onTruckingUpload', payload);
  };

  const onSubmit = (values: FormData) => {
    const files = values.dataFile!;

    const payload = {
      companyId: values.companyId,
      billingCodeId: values.billingCodeId,
      dataFile: files[0],
    } satisfies Payload;

    switch (values.type) {
      case '1':
        onFreightUpload(payload);
        break;
      case '2':
        onTruckingUpload(payload);
        break;
      default:
        break;
    }
  };

  return {
    form: {
      ...form,
      isPending: false,
      onSubmit: form.handleSubmit(onSubmit),
    },
  };
};
