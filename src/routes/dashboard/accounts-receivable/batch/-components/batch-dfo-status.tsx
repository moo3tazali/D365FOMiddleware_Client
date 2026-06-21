import { useState } from 'react';
import CheckCircle2Icon from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle';
import InfoIcon from 'lucide-react/dist/esm/icons/info';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import ActivityIcon from 'lucide-react/dist/esm/icons/activity';

import { getExpectedGroupCountLabel } from '@/constants/data-batch';
import type { TDataBatch } from '@/interfaces/data-batch';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface BatchDFOStatusProps {
  batch: TDataBatch;
}

export const BatchDFOStatus = ({ batch }: BatchDFOStatusProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expectedGroupCount =
    typeof batch.expectedGroupCount === 'number'
      ? batch.expectedGroupCount
      : undefined;
  const dfoIds = batch.dfoIds ?? [];
  const dfoPostingErrors = batch.dfoPostingErrors ?? [];
  const hasDfoIds = dfoIds.length > 0;
  const hasDfoPostingErrors = dfoPostingErrors.length > 0;
  const groupLabels = getDfoGroupLabels(batch.entryProcessorType);
  const isAdmin = useAuth((state) => state.user?.role === 'ADMIN');

  // ── Not posted yet ─────────────────────────────────────────────────────────
  if (!hasDfoIds && !hasDfoPostingErrors) {
    return (
      <StatusCard
        variant='neutral'
        icon={<InfoIcon className='size-4 text-muted-foreground' />}
        title='Not posted to D365FO yet'
        iconBg='bg-muted'
      >
        {expectedGroupCount === undefined ? (
          <p className='text-sm text-muted-foreground'>
            This batch has not been posted to Dynamics 365 Finance &amp;
            Operations.
          </p>
        ) : (
          <div className='space-y-0.5 text-sm text-muted-foreground'>
            <p>
              This batch has not been posted to Dynamics 365 Finance &amp;
              Operations.
            </p>
            <p className='font-medium text-foreground'>
              {expectedGroupCount} {groupLabels.countLabel} will be created in
              D365FO.
            </p>
          </div>
        )}
      </StatusCard>
    );
  }

  // ── Posting failed ─────────────────────────────────────────────────────────
  if (hasDfoPostingErrors) {
    return (
      <StatusCard
        variant='error'
        icon={<AlertCircleIcon className='size-4 text-destructive' />}
        title='Posting Failed'
        iconBg='bg-destructive/10 dark:bg-destructive/20'
        accentColor='bg-gradient-to-b from-destructive/50 via-destructive to-destructive/50'
      >
        <div className='space-y-3'>
          <p className='text-sm text-muted-foreground'>
            The batch failed to post to D365FO with the following errors:
          </p>
          <ul className='space-y-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3'>
            {dfoPostingErrors.map((error, idx) => (
              <li
                key={idx}
                className='flex items-start gap-2 text-sm text-destructive'
              >
                <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive' />
                {error}
              </li>
            ))}
          </ul>
          {isAdmin && <TraceLink batchId={batch.id} />}
        </div>
      </StatusCard>
    );
  }

  // ── Posting succeeded ──────────────────────────────────────────────────────
  if (hasDfoIds) {
    return (
      <StatusCard
        variant='success'
        icon={<CheckCircle2Icon className='size-4 text-emerald-600 dark:text-emerald-400' />}
        title='Successfully Posted to D365FO'
        iconBg='bg-emerald-100 dark:bg-emerald-900/40'
        accentColor='bg-gradient-to-b from-emerald-400/60 via-emerald-500 to-emerald-400/60'
      >
        <div className='space-y-3'>
          <p className='text-sm text-muted-foreground'>
            <span className='font-semibold text-foreground'>{dfoIds.length}</span>{' '}
            {groupLabels.countLabel} created successfully in D365FO.
          </p>

          {/* Collapsible IDs */}
          <div className='rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 overflow-hidden'>
            <button
              type='button'
              onClick={() => setIsExpanded((p) => !p)}
              className='flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-colors'
            >
              <span>{isExpanded ? 'Hide' : 'View'} {groupLabels.detailsLabel}</span>
              {isExpanded ? (
                <ChevronUp className='size-4' />
              ) : (
                <ChevronDown className='size-4' />
              )}
            </button>
            {isExpanded && (
              <ul className='divide-y divide-emerald-200/60 dark:divide-emerald-800/40 border-t border-emerald-200 dark:border-emerald-800/50'>
                {dfoIds.map((id, idx) => (
                  <li
                    key={idx}
                    className='flex items-center gap-2 px-4 py-2 text-sm font-mono text-emerald-900 dark:text-emerald-100'
                  >
                    <span className='text-xs text-emerald-600 dark:text-emerald-400'>
                      {groupLabels.itemLabel}
                    </span>
                    <span className='font-semibold'>{id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isAdmin && <TraceLink batchId={batch.id} />}
        </div>
      </StatusCard>
    );
  }

  return null;
};

// ── Shared card shell ────────────────────────────────────────────────────────

function StatusCard({
  icon,
  title,
  iconBg,
  accentColor,
  children,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  iconBg: string;
  accentColor?: string;
  children: React.ReactNode;
  variant: 'neutral' | 'error' | 'success';
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border px-5 py-4 space-y-3',
        variant === 'neutral' &&
          'border-border bg-muted/30',
        variant === 'error' &&
          'border-destructive/20 dark:border-destructive/30 bg-destructive/5 dark:bg-destructive/10',
        variant === 'success' &&
          'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20',
      )}
    >
      {/* Left accent bar */}
      {accentColor && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-1 rounded-l-xl',
            accentColor,
          )}
        />
      )}

      {/* Header */}
      <div className='flex items-center gap-3'>
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            iconBg,
          )}
        >
          {icon}
        </div>
        <p
          className={cn(
            'text-sm font-semibold',
            variant === 'neutral' && 'text-foreground',
            variant === 'error' && 'text-foreground',
            variant === 'success' &&
              'text-emerald-900 dark:text-emerald-100',
          )}
        >
          {title}
        </p>
      </div>

      {/* Body */}
      <div className='pl-11'>{children}</div>
    </div>
  );
}

const TraceLink = ({ batchId }: { batchId: string }) => (
  <a
    className='inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4'
    href={`/dashboard/observability?batchId=${encodeURIComponent(batchId)}`}
  >
    <ActivityIcon className='size-3.5' />
    View processing trace
  </a>
);

const getDfoGroupLabels = (
  entryProcessorType: TDataBatch['entryProcessorType'],
) => {
  if (getExpectedGroupCountLabel(entryProcessorType) === 'invoice(s)') {
    return {
      countLabel: 'invoice(s)',
      detailsLabel: 'Invoices',
      itemLabel: 'Invoice',
    };
  }

  return {
    countLabel: 'BatchNumber(s)',
    detailsLabel: 'BatchNumbers',
    itemLabel: 'BatchNumber',
  };
};
