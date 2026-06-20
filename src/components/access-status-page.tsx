import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/router';

export function AccessStatusPage({
  title,
  message,
  poll = false,
}: {
  title: string;
  message: string;
  poll?: boolean;
}) {
  const logout = useAuth((state) => state.logout);
  const refresh = useAuth((state) => state.refreshAccessStatus);
  const navigate = useNavigate();

  useEffect(() => {
    if (!poll) return;
    const timer = window.setInterval(() => {
      refresh()
        .then((user) => {
          if (user?.accessStatus === 'APPROVED') {
            navigate({ to: ROUTES.DASHBOARD.HOME, replace: true });
          }
        })
        .catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [navigate, poll, refresh]);

  return (
    <main className='min-h-screen grid place-items-center p-6'>
      <div className='max-w-lg space-y-4 text-center'>
        <h1 className='text-2xl font-semibold'>{title}</h1>
        <p className='text-muted-foreground'>{message}</p>
        <Button
          variant='outline'
          onClick={() =>
            logout().then(() => navigate({ to: ROUTES.AUTH.LOGIN }))
          }
        >
          Sign out
        </Button>
      </div>
    </main>
  );
}
