import { createFileRoute } from '@tanstack/react-router';
import { SharedDataBatchHeader as DataBatchHeader } from '@/components/batch/shared-data-batch-header';
import { DataBatchTable } from './-components/data-batch-table';
import { ErrorFallback } from '@/components/fallback/error-fallback';
import { LoadingFallback } from '@/components/fallback/loading-fallback';

export const Route = createFileRoute('/dashboard/ledger/')({
  component: LedgerPage,
  loader: ({ context }) => {
    const { services, queryClient } = context;
    queryClient.ensureQueryData(
      services.dataBatch.batchQueryOptions(
        'ledger',
        services.pagination.defaultValues,
      ),
    );
  },
  pendingComponent: LoadingFallback,
  errorComponent: ErrorFallback,
});

function LedgerPage() {
  return (
    <div className='h-full space-y-5'>
      <DataBatchHeader
        title='Ledger'
        newUploadLink='/dashboard/ledger/batch/new'
      />
      <DataBatchTable />
    </div>
  );
}
