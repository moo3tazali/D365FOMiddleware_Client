import { createFileRoute, Link } from '@tanstack/react-router';
import { SharedDataBatchHeader as DataBatchHeader } from '@/components/batch/shared-data-batch-header';
import { DataBatchTable } from './-components/data-batch-table';
import { ErrorFallback } from '@/components/fallback/error-fallback';
import { LoadingFallback } from '@/components/fallback/loading-fallback';

export const Route = createFileRoute('/dashboard/cash-in/')({
  component: CashInPage,
  loader: ({ context }) => {
    const { services, queryClient } = context;
    queryClient.ensureQueryData(
      services.dataBatch.batchQueryOptions(
        'cashIn',
        services.pagination.defaultValues,
      ),
    );
  },
  pendingComponent: LoadingFallback,
  errorComponent: ErrorFallback,
});

function CashInPage() {
  const yardInvoiceEnabled =
    import.meta.env.VITE_YARD_INVOICE_UPLOAD_ENABLED === 'true';
  return (
    <div className='h-full space-y-5'>
      <DataBatchHeader
        title='Cash In'
        newUploadLink='/dashboard/cash-in/batch/new'
      />
      {yardInvoiceEnabled && (
        <p className='text-sm'>
          Yard invoices:{' '}
          <Link to='/dashboard/cash-in/yard-invoice' className='underline'>
            review and submit an invoice upload
          </Link>
        </p>
      )}
      <DataBatchTable />
    </div>
  );
}
