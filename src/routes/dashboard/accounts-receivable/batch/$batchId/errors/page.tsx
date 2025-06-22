import { createFileRoute } from '@tanstack/react-router';

import { BatchErrorTable } from '../../-components/batch-error-table';
import { BatchErrorHeader } from '../../-components/batch-error-header';

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/batch/$batchId/errors/'
)({
  component: BatchErrorPage,
  beforeLoad: async ({ params, context, search }) => {
    const { services, queryClient } = context;
    const { batchId } = params;

    await queryClient.prefetchQuery(
      services.dataBatchError.errorListQueryOptions({ ...search, batchId })
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
