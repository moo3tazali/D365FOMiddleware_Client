import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/dashboard/cash-management/'
)({
  component: CashManagement,
});

function CashManagement() {
  return <div>Hello "/dashboard/cash-management/"!</div>;
}
