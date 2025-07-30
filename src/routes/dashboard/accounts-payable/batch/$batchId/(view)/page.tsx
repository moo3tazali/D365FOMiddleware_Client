import { createFileRoute } from '@tanstack/react-router';
import { BatchHeader } from '../../-components/batch-header';
import { BatchForm } from '../../-components/batch-form';
import { BatchResult } from '../../-components/batch-result';
import { BatchFooter } from '../../-components/batch-footer';

export const Route = createFileRoute(
  '/dashboard/accounts-payable/batch/$batchId/(view)/'
)({
  component: ViewBatchPage,
  loader: ({ params, context }) => {
    const batchNumber = params.batchId;
    const { queryClient, services } = context;
    queryClient.ensureQueryData(
      services.dataBatch.batchByIdQueryOptions(batchNumber)
    );
  },
});

function ViewBatchPage() {
  return (
    <div className='h-full flex flex-col gap-5'>
      <BatchHeader />
      <BatchForm />
      <BatchResult />
      <BatchFooter />
    </div>
  );
}
