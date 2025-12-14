import { createFileRoute } from '@tanstack/react-router';

import { BatchErrorTable } from '../../-components/batch-error-table';
import { BatchErrorHeader } from '../../-components/batch-error-header';

export const Route = createFileRoute(
  '/dashboard/ledger/batch/$batchId/errors/'
)({
  component: BatchErrorPage,
  loader: ({ params, context }) => {
    const { services, queryClient } = context;
    const { batchId } = params;

    queryClient.ensureQueryData(
      services.dataBatchError.errorListQueryOptions({
        ...services.pagination.defaultValues,
        batchId,
      })
    );
  },
});

function BatchErrorPage() {
  return (
    <div className='h-full flex flex-col gap-5'>
      <BatchErrorHeader />
      <BatchErrorTable />
    </div>
  );
}
