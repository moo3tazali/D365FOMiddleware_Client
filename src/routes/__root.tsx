import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { QueryClient } from '@tanstack/react-query';
import type { TServices } from '@/services';

interface RouterContext {
  auth: null;
  queryClient: QueryClient;
  services: TServices;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Routes,
});

function Routes() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position='bottom-right' />
    </>
  );
}
