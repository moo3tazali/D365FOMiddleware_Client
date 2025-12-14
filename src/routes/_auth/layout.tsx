import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AuthHeader } from './-components/auth-header';
import { ROUTES } from '@/router';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  beforeLoad: ({ context: { auth } }) => {
    const isAuthenticated = auth.isAuthenticated;

    if (isAuthenticated)
      throw redirect({
        to: ROUTES.DASHBOARD.HOME,
      });
  },
});

function AuthLayout() {
  return (
    <div className='h-full container mx-auto flex flex-col'>
      <AuthHeader />

      <main className='flex-1 flex items-center justify-center'>
        <Outlet />
      </main>
    </div>
  );
}
