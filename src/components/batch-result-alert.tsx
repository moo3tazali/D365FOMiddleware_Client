import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle2Icon from 'lucide-react/dist/esm/icons/check-circle-2';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import { Link } from '@tanstack/react-router';

import { cn } from '@/lib/utils';
import type { TRoutes } from '@/router';

interface BatchResultAlertProps {
  errorCount: number;
  batchId: string;
  errorsRoute: TRoutes;
  successMessage?: string;
}

/**
 * Displays a success banner (no errors) or an error banner with a CTA
 * linking to the errors page. Shared across all batch modules.
 */
export function BatchResultAlert({
  errorCount,
  batchId,
  errorsRoute,
  successMessage = 'All entries have been formatted. Click Post to D365FO to send them to Dynamics 365 Finance & Operations.',
}: BatchResultAlertProps) {
  if (!errorCount) {
    return (
      <div
        className={cn(
          'relative flex items-start gap-3 overflow-hidden rounded-xl',
          'border border-emerald-200 dark:border-emerald-800/50',
          'bg-emerald-50 dark:bg-emerald-950/20',
          'px-5 py-4',
        )}
      >
        {/* Left accent */}
        <div className='absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-emerald-400/60 via-emerald-500 to-emerald-400/60' />

        <div className='mt-0.5 shrink-0 flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40'>
          <CheckCircle2Icon className='size-4 text-emerald-600 dark:text-emerald-400' />
        </div>

        <div className='space-y-0.5'>
          <p className='text-sm font-semibold text-emerald-900 dark:text-emerald-100'>
            Entries processed successfully
          </p>
          <p className='text-sm text-emerald-800/80 dark:text-emerald-300/80'>
            {successMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col sm:flex-row sm:items-center gap-4 overflow-hidden rounded-xl',
        'border border-destructive/20 dark:border-destructive/30',
        'bg-destructive/5 dark:bg-destructive/10',
        'px-5 py-4',
      )}
    >
      {/* Left accent */}
      <div className='absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-destructive/50 via-destructive to-destructive/50' />

      {/* Icon + text */}
      <div className='flex items-start gap-3 flex-1 min-w-0'>
        <div className='mt-0.5 shrink-0 flex size-8 items-center justify-center rounded-lg bg-destructive/10 dark:bg-destructive/20'>
          <AlertCircleIcon className='size-4 text-destructive' />
        </div>
        <div className='space-y-0.5'>
          <p className='text-sm font-semibold text-foreground'>
            {errorCount.toLocaleString('en-US')} error
            {errorCount !== 1 ? 's' : ''} found while processing this batch
          </p>
          <p className='text-sm text-muted-foreground'>
            Review and resolve these errors before posting to D365FO.
          </p>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={errorsRoute}
        params={{ batchId }}
        className={cn(
          'group relative inline-flex shrink-0 items-center gap-0 overflow-hidden',
          'rounded-md text-sm font-semibold h-9',
          'bg-destructive text-white shadow-sm',
          'transition-all duration-200 ease-out',
          'hover:bg-destructive/90 hover:shadow-destructive/30 hover:shadow-md hover:-translate-y-px',
          'active:translate-y-0 active:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-1',
        )}
      >
        <span className='flex h-full items-center px-2.5 border-r border-white/15 bg-black/10 group-hover:bg-black/15 transition-colors duration-200'>
          <AlertCircleIcon className='size-3.5' />
        </span>
        <span className='px-3'>View Errors</span>
        <span className='flex h-full items-center pl-0 pr-2.5'>
          <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
        </span>
      </Link>
    </div>
  );
}
