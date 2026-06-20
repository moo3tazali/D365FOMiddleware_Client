import { useState } from 'react';
import type { FormEvent } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useServices } from '@/hooks/use-services';
import { ROUTES } from '@/router';

export const Route = createFileRoute('/change-password')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.mustChangePassword) {
      throw redirect({ to: ROUTES.DASHBOARD.HOME });
    }
  },
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const { users } = useServices();
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await users.changePassword({ currentPassword, newPassword });
      await logout();
      navigate({ to: ROUTES.AUTH.LOGIN, replace: true });
    } catch {
      setError(
        'Password change failed. Verify the current password and requirements.',
      );
    }
  }

  return (
    <main className='min-h-screen grid place-items-center p-6'>
      <form className='w-full max-w-md space-y-4' onSubmit={submit}>
        <h1 className='text-2xl font-semibold'>Change initial password</h1>
        <p className='text-sm text-muted-foreground'>
          Replace the bootstrap password before using administrator features.
        </p>
        <Input
          type='password'
          placeholder='Current password'
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
        <Input
          type='password'
          minLength={12}
          placeholder='New password (minimum 12 characters)'
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        {error && <p className='text-sm text-destructive'>{error}</p>}
        <Button className='w-full' type='submit'>
          Change password
        </Button>
      </form>
    </main>
  );
}
