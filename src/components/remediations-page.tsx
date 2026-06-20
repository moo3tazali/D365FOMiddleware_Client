import { useQuery } from '@tanstack/react-query';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';

import { useServices } from '@/hooks/use-services';
import { Description } from '@/components/ui/description';
import { CustomerRemediationCard } from '@/components/customer-remediation-card';

interface RemediationsPageProps {
  batchId: string;
}

export function RemediationsPage({ batchId }: RemediationsPageProps) {
  const { dataBatch } = useServices();

  const { data: summary, isPending } = useQuery(
    dataBatch.remediationSummaryQueryOptions(batchId),
  );

  const customerType = summary?.types.find((t) => t.type === 'customer');

  return (
    <div className='h-full flex flex-col gap-6'>
      {/* Page header */}
      <div className='flex items-center gap-3'>
        <div className='p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg'>
          <Wrench className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
        </div>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Remediations</h1>
          <Description>
            Corrective actions available for this batch. Create missing master
            data records to resolve blocked entries.
          </Description>
        </div>
      </div>

      {/* Summary strip */}
      {isPending ? (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin text-primary' />
          Loading summary…
        </div>
      ) : !summary || summary.total === 0 ? (
        <div className='flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50'>
          <CheckCircle2 className='h-4 w-4 text-emerald-500' />
          No remediation actions required for this batch.
        </div>
      ) : null}

      {/* Remediation type cards */}
      {/* Currently only customer type is supported. Future types (vendor, item, etc.)
          will be added here as additional cards. */}
      {(summary?.total ?? 0) > 0 && (
        <div className='grid grid-cols-2 gap-5'>
          {customerType && (
            <CustomerRemediationCard
              batchId={batchId}
              initialTotal={customerType.count}
              initialAffectedRows={customerType.affectedRows}
            />
          )}
          {/* Future remediation types will be rendered here, e.g.:
            {vendorType && <VendorRemediationCard batchId={batchId} ... />}
          */}
        </div>
      )}
    </div>
  );
}
