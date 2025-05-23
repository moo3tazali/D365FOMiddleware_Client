import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/'
)({
  component: AccountsReceivablePage,
});

function AccountsReceivablePage() {
  return (
    <div>Hello "/dashboard/accounts-receivable/"!</div>
  );
}
