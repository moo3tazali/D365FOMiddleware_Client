import { createFileRoute } from '@tanstack/react-router';

import { BatchHeader } from './-components/batch-header';
import { BatchForm } from './-components/batch-form';
import { BatchResult } from './-components/batch-result';
import { BatchFooter } from './-components/batch-footer';
import { LoadingFallback } from '@/components/fallback';
import { z } from 'zod';

const TSearchSchema = z.object({
  batchId: z
    .string()
    .length(26, 'Invalid ID length')
    .regex(/^[A-Z0-9]+$/i, 'Invalid characters in ID')
    .optional(),
});

export const Route = createFileRoute('/dashboard/accounts-receivable/batch/')({
  component: BatchPage,
  validateSearch: (search) => {
    const result = TSearchSchema.safeParse(search);

    if (!result.success) {
      return { batchId: undefined };
    }

    return result.data;
  },
  beforeLoad: async ({ search, context }) => {
    const batchNumber = search?.batchId;
    if (!batchNumber) return;

    const { queryClient, services } = context;
    await queryClient.prefetchQuery(
      services.dataBatch.freightDocumentQueryOptions({
        batchNumber,
      })
    );
  },
  pendingComponent: LoadingFallback,
});

function BatchPage() {
  return (
    <div className='h-full flex flex-col gap-5'>
      <BatchHeader />
      <BatchForm />
      <BatchResult />
      <BatchFooter />
    </div>
  );
}
