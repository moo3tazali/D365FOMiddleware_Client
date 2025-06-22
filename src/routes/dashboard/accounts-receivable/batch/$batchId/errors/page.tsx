import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/batch/$batchId/errors/'
)({
  component: BatchErrorsPage,
  beforeLoad: async ({ params, search, context }) => {},
});

function BatchErrorsPage() {
  return (
    <div>Hello "/dashboard/accounts-receivable/batch/$batchId/errors/"!</div>
  );
}
