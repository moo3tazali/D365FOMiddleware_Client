import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useCookies } from 'react-cookie';

import { ROUTES } from '@/router';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './-components/dashboard-sidebar';
import { DashboardHeader } from './-components/dashboard-header';
import { ErrorFallback, NotFoundFallback } from '@/components/fallback';
import { SIDEBAR_COOKIE_NAME } from '@/constants/cookies';
import { LoginModal } from '../_auth/-components/login-modal';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
  beforeLoad: ({ location, context: { auth } }) => {
    const isAuthenticated = auth.isAuthenticated;

    if (!isAuthenticated)
      throw redirect({
        to: ROUTES.AUTH.LOGIN,
        search: { redirect: location.pathname },
      });
  },
  notFoundComponent: NotFoundFallback,
  errorComponent: ErrorFallback,
});

function DashboardLayout() {
  const [{ sidebar_state }] = useCookies([SIDEBAR_COOKIE_NAME]);

  return (
    <>
      <SidebarProvider defaultOpen={sidebar_state}>
        <DashboardSidebar />
        <SidebarInset className='overflow-hidden'>
          <DashboardHeader />
          <div className='flex-1 p-4 border-t'>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <LoginModal />
    </>
  );
}
