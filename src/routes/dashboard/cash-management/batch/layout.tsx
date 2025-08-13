import { createFileRoute, Outlet } from '@tanstack/react-router';

import { ErrorFallback } from '@/components/fallback';

export const Route = createFileRoute('/dashboard/cash-management/batch')({
  component: BatchLayoutComponent,
  errorComponent: ErrorFallback,
});

function BatchLayoutComponent() {
  return <Outlet />;
}
