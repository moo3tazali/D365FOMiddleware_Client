import { createFileRoute } from '@tanstack/react-router';
import { BatchHeader } from '../../-components/batch-header';
import { BatchForm } from '../../-components/batch-form';
import { BatchResult } from '../../-components/batch-result';
import { BatchFooter } from '../../-components/batch-footer';
import { NotFoundFallback } from '@/components/fallback';
import { useBatchQueryData } from '../../-hooks/use-batch-query-data';

export const Route = createFileRoute(
  '/dashboard/accounts-payable/batch/$batchId/(view)/'
)({
  component: ViewBatchPage,
  loader: ({ params, context }) => {
    const batchId = params.batchId;
    const { queryClient, services } = context;
    queryClient.ensureQueryData(
      services.dataBatch.batchByIdQueryOptions(batchId)
    );
  },
});

function ViewBatchPage() {
  const [batch] = useBatchQueryData();

  if (!batch)
    return (
      <NotFoundFallback data='This batch is no longer available or may not exist.' />
    );
  return (
    <div className='h-full flex flex-col gap-5'>
      <BatchHeader />
      <BatchForm />
      <BatchResult />
      <BatchFooter />
    </div>
  );
}
