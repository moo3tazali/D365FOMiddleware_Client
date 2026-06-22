import { createFileRoute } from '@tanstack/react-router';
import { SharedDataBatchHeader as DataBatchHeader } from '@/components/batch/shared-data-batch-header';
import { DataBatchTable } from './-components/data-batch-table';
import { ErrorFallback } from '@/components/fallback/error-fallback';
import { LoadingFallback } from '@/components/fallback/loading-fallback';

export const Route = createFileRoute('/dashboard/cash-management/')({
  component: CashManagementPage,
  loader: ({ context }) => {
    const { services, queryClient } = context;
    queryClient.ensureQueryData(
      services.dataBatch.batchQueryOptions(
        'cashManagement',
        services.pagination.defaultValues,
      ),
    );
  },
  pendingComponent: LoadingFallback,
  errorComponent: ErrorFallback,
});

function CashManagementPage() {
  return (
    <div className='h-full space-y-10'>
      <DataBatchHeader
        title='Cash Management'
        newUploadLink='/dashboard/cash-management/batch/new'
      />
      <DataBatchTable />
    </div>
  );
}
