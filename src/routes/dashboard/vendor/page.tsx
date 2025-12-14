import { createFileRoute } from '@tanstack/react-router';
import { DataBatchHeader } from './-components/data-batch-header';
import { DataBatchTable } from './-components/data-batch-table';
import { ErrorFallback, LoadingFallback } from '@/components/fallback';

export const Route = createFileRoute('/dashboard/vendor/')({
  component: VendorPage,
  loader: ({ context }) => {
    const { services, queryClient } = context;
    queryClient.ensureQueryData(
      services.dataBatch.batchQueryOptions(
        'vendor',
        services.pagination.defaultValues
      )
    );
  },
  pendingComponent: LoadingFallback,
  errorComponent: ErrorFallback,
});

function VendorPage() {
  return (
    <div className='h-full space-y-10'>
      <DataBatchHeader />
      <DataBatchTable />
    </div>
  );
}
