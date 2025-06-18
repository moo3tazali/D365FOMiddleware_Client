import { createFileRoute } from '@tanstack/react-router';
import { AccountsReceivableHeader } from './-components/account-receivable-header';
import { DataBatchTable } from './-components/data-batch-table';
import { LoadingFallback } from '@/components/fallback';

export const Route = createFileRoute('/dashboard/accounts-receivable/')({
  component: AccountsReceivablePage,
  beforeLoad: async ({ context, search }) => {
    const { services, queryClient } = context;
    await queryClient.prefetchQuery(
      services.dataBatch.freightDocumentQueryOptions(search)
    );
  },
  pendingComponent: LoadingFallback,
});

function AccountsReceivablePage() {
  return (
    <div className='h-full space-y-10'>
      <AccountsReceivableHeader />
      <DataBatchTable />
    </div>
  );
}
