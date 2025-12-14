import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z.email('Invalid email address').min(1, 'Email is required'),
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
    // eslint-disable-next-line no-console
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
