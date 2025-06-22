import { z } from 'zod';
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';

import { LoadingFallback, NotFoundFallback } from '@/components/fallback';

const batchIdSchema = z.string().ulid();

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/batch/$batchId'
)({
  component: ViewBatchLayout,
  loader: ({ params }) => {
    const isValidId = batchIdSchema.safeParse(params.batchId).success;

    if (isValidId) return;

    throw notFound();
  },
  pendingComponent: LoadingFallback,
  notFoundComponent: NotFoundFallback,
});

function ViewBatchLayout() {
  return <Outlet />;
}
