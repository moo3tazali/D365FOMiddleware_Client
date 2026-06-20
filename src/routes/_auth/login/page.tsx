import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '../-components/login-form';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/_auth/login/')({
  component: LoginPage,
});

function LoginPage() {
  const [adminMode, setAdminMode] = useState(false);
  const startMicrosoftLogin = useAuth((state) => state.startMicrosoftLogin);
  return (
    <div className='flex flex-col gap-6 w-full max-w-md'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            {adminMode ? 'Administrator sign in' : 'Sign in'}
          </CardTitle>
          <CardDescription>
            {adminMode
              ? 'Use the local platform administrator credentials.'
              : 'Use your company Microsoft account to request or access the platform.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminMode ? (
            <div className='space-y-4'>
              <LoginForm />
              <Button
                className='w-full'
                variant='ghost'
                onClick={() => setAdminMode(false)}
              >
                Back to Microsoft sign in
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <Button
                className='w-full'
                onClick={() => startMicrosoftLogin('/dashboard')}
              >
                Continue with Microsoft
              </Button>
              <Button
                className='w-full'
                variant='link'
                onClick={() => setAdminMode(true)}
              >
                Administrator sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
