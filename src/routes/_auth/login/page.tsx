import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '../-components/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/_auth/login/')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className='flex flex-col gap-6 w-full max-w-md'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
