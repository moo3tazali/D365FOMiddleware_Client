import { useEffect, useState } from 'react';
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/router';

export const Route = createFileRoute('/microsoft-callback')({
  component: MicrosoftCallbackPage,
});

function MicrosoftCallbackPage() {
  const exchange = useAuth((state) => state.exchangeMicrosoftCode);
  const navigate = useNavigate();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const returnPath = params.get('returnPath');
    if (!code) {
      setError('The Microsoft login code is missing.');
      return;
    }
    window.history.replaceState({}, document.title, window.location.pathname);
    exchange(code)
      .then((user) => {
        if (user.mustChangePassword) {
          return navigate({ to: ROUTES.AUTH.CHANGE_PASSWORD, replace: true });
        }
        if (user.accessStatus === 'PENDING') {
          return navigate({ to: ROUTES.ACCESS.PENDING, replace: true });
        }
        if (user.accessStatus === 'REJECTED') {
          return navigate({ to: ROUTES.ACCESS.REJECTED, replace: true });
        }
        if (user.accessStatus === 'REVOKED') {
          return navigate({ to: ROUTES.ACCESS.REVOKED, replace: true });
        }
        if (returnPath?.startsWith('/') && !returnPath.startsWith('//')) {
          return router.history.replace(returnPath);
        }
        return navigate({ to: ROUTES.DASHBOARD.HOME, replace: true });
      })
      .catch(() =>
        setError('Microsoft sign in expired or could not be completed.'),
      );
  }, [exchange, navigate, router.history]);

  if (!error) return <p>Completing Microsoft sign in…</p>;
  return (
    <div className='space-y-4 text-center'>
      <p>{error}</p>
      <Button onClick={() => navigate({ to: ROUTES.AUTH.LOGIN })}>
        Restart sign in
      </Button>
    </div>
  );
}
