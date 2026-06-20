import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useServices } from '@/hooks/use-services';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '@/router';

export const Route = createFileRoute('/dashboard/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const { users } = useServices();
  const authUser = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(authUser?.firstName ?? '');
  const [lastName, setLastName] = useState(authUser?.lastName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const isAdmin = authUser?.role === 'ADMIN';

  useEffect(() => {
    users.me().then((user) => {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
    });
  }, [users]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (isAdmin) await users.updateProfile({ firstName, lastName });
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    await users.changePassword({ currentPassword, newPassword });
    await logout();
    navigate({ to: ROUTES.AUTH.LOGIN, replace: true });
  }

  return (
    <div className='max-w-xl space-y-8'>
      <form className='space-y-4' onSubmit={save}>
        <h1 className='text-2xl font-semibold'>Profile</h1>
        <Input value={authUser?.email ?? ''} disabled />
        <Input
          value={firstName}
          disabled={!isAdmin}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder='First name'
        />
        <Input
          value={lastName}
          disabled={!isAdmin}
          onChange={(event) => setLastName(event.target.value)}
          placeholder='Last name'
        />
        {!isAdmin && (
          <p className='text-sm text-muted-foreground'>
            Workforce profile fields are managed by Microsoft.
          </p>
        )}
        {isAdmin && <Button type='submit'>Save profile</Button>}
      </form>
      {isAdmin && (
        <form className='space-y-4' onSubmit={changePassword}>
          <h2 className='text-lg font-medium'>Change password</h2>
          <Input
            type='password'
            placeholder='Current password'
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <Input
            type='password'
            minLength={12}
            placeholder='New password'
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <Button type='submit'>Change password and sign out</Button>
        </form>
      )}
    </div>
  );
}
