import { createFileRoute } from '@tanstack/react-router';
import { AccountsReceivableHeader } from './-components/account-receivable-header';
import { DataBatchTable } from './-components/data-batch-table';

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/'
)({
  component: AccountsReceivablePage,
});

function AccountsReceivablePage() {
  return (
    <div className='h-full space-y-10'>
      <AccountsReceivableHeader />
      <DataBatchTable />
    </div>
  );
}
