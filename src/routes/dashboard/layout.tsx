import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useCookies } from 'react-cookie';

import { ROUTES } from '@/router';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './-components/dashboard-sidebar';
import { DashboardHeader } from './-components/dashboard-header';
import { ErrorFallback } from '@/components/fallback/error-fallback';
import { LoadingFallback } from '@/components/fallback/loading-fallback';
import { NotFoundFallback } from '@/components/fallback/not-found-fallback';
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

    const user = auth.user;
    if (user?.mustChangePassword) {
      throw redirect({ to: ROUTES.AUTH.CHANGE_PASSWORD });
    }
    if (user?.accessStatus === 'PENDING') {
      throw redirect({ to: ROUTES.ACCESS.PENDING });
    }
    if (user?.accessStatus === 'REJECTED') {
      throw redirect({ to: ROUTES.ACCESS.REJECTED });
    }
    if (user?.accessStatus === 'REVOKED') {
      throw redirect({ to: ROUTES.ACCESS.REVOKED });
    }
  },
  notFoundComponent: NotFoundFallback,
  errorComponent: ErrorFallback,
  pendingComponent: LoadingFallback,
});

function DashboardLayout() {
  const [{ sidebar_state }] = useCookies([SIDEBAR_COOKIE_NAME]);

  return (
    <>
      <SidebarProvider defaultOpen={sidebar_state}>
        <DashboardSidebar />
        <SidebarInset className='overflow-hidden'>
          <DashboardHeader />
          <div className='flex-1 p-4 md:p-6 overflow-y-auto'>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <LoginModal />
    </>
  );
}
