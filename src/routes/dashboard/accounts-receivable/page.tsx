import { createFileRoute } from '@tanstack/react-router';
import { DataBatchHeader } from './-components/data-batch-header';
import { DataBatchTable } from './-components/data-batch-table';
import { ErrorFallback, LoadingFallback } from '@/components/fallback';

export const Route = createFileRoute('/dashboard/accounts-receivable/')({
  component: AccountsReceivablePage,
  beforeLoad: async ({ context, search }) => {
    const { services, queryClient } = context;

    await queryClient.prefetchQuery(
      services.dataBatch.freightDocumentQueryOptions(
        'accountReceivable',
        search
      )
    );
  },
  pendingComponent: LoadingFallback,
  errorComponent: ErrorFallback,
});

function AccountsReceivablePage() {
  return (
    <div className='h-full space-y-10'>
      <DataBatchHeader />
      <DataBatchTable />
    </div>
  );
}
