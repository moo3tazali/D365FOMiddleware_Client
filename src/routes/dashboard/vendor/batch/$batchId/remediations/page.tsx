import { createFileRoute } from '@tanstack/react-router';

import { RemediationsPage } from '@/components/remediations-page';

export const Route = createFileRoute(
  '/dashboard/vendor/batch/$batchId/remediations/'
)({
  component: BatchRemediationsPage,
  loader: ({ params, context }) => {
    const { services, queryClient } = context;
    const { batchId } = params;

    queryClient.ensureQueryData(
      services.dataBatch.remediationSummaryQueryOptions(batchId)
    );
  },
});

function BatchRemediationsPage() {
  const { batchId } = Route.useParams();
  return (
    <div className='h-full flex flex-col gap-5'>
      <RemediationsPage batchId={batchId} />
    </div>
  );
}
