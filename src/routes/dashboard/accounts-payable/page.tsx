import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/dashboard/accounts-payable/'
)({
  component: AccountsPayablePage,
});

function AccountsPayablePage() {
  return <div>Hello "/dashboard/accounts-payable/"!</div>;
}
