import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

import { useServices } from '@/hooks/use-services';
import type { TRoutes } from '@/router';
import { cn } from '@/lib/utils';

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
      <div className='flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground'>
        <Loader2 className='size-4 shrink-0 animate-spin' />
        <span>Checking for available remediations…</span>
      </div>
    );
  }

  if (!summary || summary.total === 0) return null;

  const typeSummary = summary.types
    .map(
      (t) =>
        `${t.count.toLocaleString('en-US')} ${t.type}${t.count !== 1 ? 's' : ''} can be created`,
    )
    .join(' · ');

  return (
    <div
      className={cn(
        'relative flex flex-col sm:flex-row sm:items-center gap-4',
        'overflow-hidden rounded-xl border border-primary/20',
        'bg-primary/5 dark:bg-primary/10',
        'px-5 py-4',
      )}
    >
      {/* Decorative left accent bar */}
      <div className='absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-primary/60 via-primary to-primary/60' />

      {/* Icon + text */}
      <div className='flex items-start gap-3 flex-1 min-w-0'>
        <div className='mt-0.5 shrink-0 flex size-8 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/20'>
          <Wrench className='size-4 text-primary' />
        </div>

        <div className='min-w-0 space-y-0.5'>
          <p className='text-sm font-semibold text-foreground flex items-center gap-1.5'>
            <span>Remediations Available</span>
            <Sparkles className='size-3.5 text-primary opacity-80' />
          </p>
          <p className='text-sm text-muted-foreground'>
            <span className='font-bold text-foreground'>
              {summary.total.toLocaleString('en-US')}
            </span>{' '}
            remediation{summary.total !== 1 ? 's' : ''} available
          </p>
          <p className='text-xs text-muted-foreground truncate'>{typeSummary}</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={remediationsRoute}
        params={{ batchId }}
        className={cn(
          'group relative inline-flex shrink-0 items-center gap-0 overflow-hidden',
          'rounded-md text-sm font-semibold h-9',
          'bg-primary text-primary-foreground shadow-sm',
          'transition-all duration-200 ease-out',
          'hover:shadow-primary/30 hover:shadow-md hover:-translate-y-px',
          'active:translate-y-0 active:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1',
        )}
      >
        <span className='flex h-full items-center px-2.5 border-r border-white/15 bg-black/10 group-hover:bg-black/15 transition-colors duration-200'>
          <Wrench className='size-3.5' />
        </span>
        <span className='px-3'>Review Remediations</span>
        <span className='flex h-full items-center pl-0 pr-2.5'>
          <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
        </span>
      </Link>
    </div>
  );
}
