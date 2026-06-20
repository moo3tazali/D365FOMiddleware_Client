import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

import { useServices } from '@/hooks/use-services';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { TRoutes } from '@/router';

interface RemediationsSummaryAlertProps {
  batchId: string;
  remediationsRoute: TRoutes;
}

export function RemediationsSummaryAlert({
  batchId,
  remediationsRoute,
}: RemediationsSummaryAlertProps) {
  const { dataBatch } = useServices();

  const { data: summary, isPending } = useQuery(
    dataBatch.remediationSummaryQueryOptions(batchId),
  );

  if (isPending) {
    return (
      <Alert variant='default'>
        <Loader2 className='h-4 w-4 animate-spin' />
        <AlertTitle>Checking remediations…</AlertTitle>
        <AlertDescription>
          Looking for corrective actions available for this batch.
        </AlertDescription>
      </Alert>
    );
  }

  if (!summary || summary.total === 0) return null;

  const typeSummary = summary.types
    .map((t) => `${t.count.toLocaleString('en-US')} ${t.type}${t.count !== 1 ? 's' : ''} can be created`)
    .join(', ');

  return (
    <Alert
      variant='default'
      className='bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
    >
      <Wrench className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
      <AlertTitle className='text-indigo-900 dark:text-indigo-100 font-semibold'>
        Remediations Available
      </AlertTitle>
      <AlertDescription className='text-indigo-800 dark:text-indigo-200'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1'>
          <div className='space-y-0.5'>
            <p className='text-sm'>
              <span className='font-bold'>
                {summary.total.toLocaleString('en-US')}
              </span>{' '}
              remediation{summary.total !== 1 ? 's' : ''} available
            </p>
            <p className='text-xs text-indigo-700 dark:text-indigo-300'>
              {typeSummary}
            </p>
          </div>
          <Button
            size='sm'
            asChild
            className='bg-indigo-600 hover:bg-indigo-700 text-white border-0 shrink-0'
          >
            <Link to={remediationsRoute} params={{ batchId }}>
              Review remediations
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
