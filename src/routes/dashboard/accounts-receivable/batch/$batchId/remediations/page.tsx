import { createFileRoute } from '@tanstack/react-router';

import { RemediationsPage } from '@/components/remediations-page';

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/batch/$batchId/remediations/'
)({
  component: BatchRemediationsPage,
  loader: ({ params, context }) => {
    const { services, queryClient } = context;
    const { batchId } = params;

    // Prefetch summary so the page has it immediately
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
