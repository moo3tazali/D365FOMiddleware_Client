import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';

import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';

const FormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof FormSchema>;

export const useLogin = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: 'm@test.com',
      password: 'Mm@159159',
    },
  });

  const { authService } = useServices();

  const navigate = useNavigate();

  const router = useRouter();

  const redirect = useSearch({
    strict: false,
    select: (s: { redirect?: string }) => s?.redirect ?? '',
  });

  const { mutate: login, isPending } = useMutation({
    operationName: 'login',
    mutationFn: authService.login,
    formControl: form.control,
    onSuccess: () => {
      if (redirect) {
        return router.history.push(redirect);
      }

      navigate({
        to: '/dashboard',
        replace: true,
      });
    },
  });

  function onSubmit(values: FormData) {
    login(values);
  }

  return {
    form: {
      ...form,
      isPending,
      onSubmit: form.handleSubmit(onSubmit),
    },
  };
};
