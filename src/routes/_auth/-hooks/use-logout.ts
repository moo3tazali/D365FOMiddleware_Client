import { useNavigate } from '@tanstack/react-router';

import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@/hooks/use-mutation';
import { ROUTES } from '@/router';

export const useLogout = () => {
  const logout = useAuth((s) => s.logout);

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    operationName: 'logout',
    mutationFn: logout,
    onSuccess: () => {
      navigate({
        to: ROUTES.AUTH.LOGIN,
        search: { redirect: location.pathname },
      });
    },
  });

  return { onLogout: mutate, isPending };
};
