import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

type FormData = z.infer<typeof formSchema>;

export const useResetPw = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: FormData) {
    console.log(values);
  }

  return {
    form: {
      ...form,
      isPending: false,
      onSubmit: form.handleSubmit(onSubmit),
    },
  };
};
