import {
  createFileRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useCookies } from 'react-cookie';

import { ROUTES } from '@/router';
import { AuthGuard } from '@/guards/auth-guard';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { DashboardSidebar } from './-components/dashboard-sidebar';
import { DashboardHeader } from './-components/dashboard-header';
import { NotFoundFallback } from '@/components/fallback';
import { SIDEBAR_COOKIE_NAME } from '@/constants/cookies';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
  beforeLoad: ({ location }) => {
    // TODO: check if user is authenticated
    const isAuthenticated = true;

    if (!isAuthenticated)
      throw redirect({
        to: ROUTES.AUTH.LOGIN,
        search: { redirect: location.pathname },
      });
  },
  notFoundComponent: NotFoundFallback,
});

function DashboardLayout() {
  const [{ sidebar_state }] = useCookies([
    SIDEBAR_COOKIE_NAME,
  ]);

  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={sidebar_state}>
        <DashboardSidebar />
        <SidebarInset className='overflow-hidden'>
          <DashboardHeader />
          <div className='flex-1 p-4 border-t'>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
