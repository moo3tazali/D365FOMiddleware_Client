import { z } from 'zod';
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';

import { ErrorFallback } from '@/components/fallback/error-fallback';
import { LoadingFallback } from '@/components/fallback/loading-fallback';
import { NotFoundFallback } from '@/components/fallback/not-found-fallback';

const batchIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, {
  message: 'Invalid MongoDB ObjectId',
});

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/batch/$batchId',
)({
  component: ViewBatchLayout,
  loader: ({ params }) => {
    const isValidId = batchIdSchema.safeParse(params.batchId).success;

    if (isValidId) return;

    throw notFound();
  },
  pendingComponent: LoadingFallback,
  notFoundComponent: NotFoundFallback,
  errorComponent: ErrorFallback,
});

function ViewBatchLayout() {
  return <Outlet />;
}
