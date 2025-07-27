import { createFileRoute, Outlet } from '@tanstack/react-router';

import { ErrorFallback } from '@/components/fallback';

export const Route = createFileRoute('/dashboard/accounts-receivable/batch')({
  component: BatchLayoutComponent,
  errorComponent: ErrorFallback,
});

function BatchLayoutComponent() {
  return <Outlet />;
}
