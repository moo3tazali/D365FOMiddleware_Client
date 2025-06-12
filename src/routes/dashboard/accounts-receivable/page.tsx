import { createFileRoute } from '@tanstack/react-router';
import { AccountsReceivableHeader } from './-components/account-receivable-header';

export const Route = createFileRoute('/dashboard/accounts-receivable/')({
  component: AccountsReceivablePage,
});

function AccountsReceivablePage() {
  return (
    <div className='h-full'>
      <AccountsReceivableHeader />
    </div>
  );
}
