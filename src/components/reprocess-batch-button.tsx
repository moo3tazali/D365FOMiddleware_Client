import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

import { cn } from '@/lib/utils';
import { useBatchReprocess } from '@/hooks/use-batch-reprocess';
import type { TDataBatch } from '@/interfaces/data-batch';

interface ReprocessBatchButtonProps {
  batch?: TDataBatch;
}

export function ReprocessBatchButton({ batch }: ReprocessBatchButtonProps) {
  const { canReprocess, isPending, reprocess } = useBatchReprocess(batch);

  const isDisabled = !batch || !canReprocess || isPending;

  return (
    <button
      type='button'
      disabled={isDisabled}
      title={
        canReprocess
          ? 'Queue batch reprocessing'
          : 'Only the batch owner or an administrator can reprocess this batch.'
      }
      onClick={() => reprocess(undefined)}
      className={cn(
        // Base layout
        'group relative inline-flex h-9 items-center gap-0 overflow-hidden rounded-md text-sm font-semibold',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1',

        // Enabled — premium gradient look
        !isDisabled && [
          'bg-primary text-primary-foreground shadow-sm',
          'hover:shadow-primary/30 hover:shadow-md hover:-translate-y-px',
          'active:translate-y-0 active:shadow-sm',
        ],

        // Disabled
        isDisabled && 'cursor-not-allowed opacity-50',

        // Pending shimmer overlay via pseudo — handled with a wrapper div
        isPending && 'bg-primary/80',
      )}
    >
      {/* Shimmer sweep while pending */}
      {isPending && (
        <span
          aria-hidden
          className='pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent'
        />
      )}

      {/* Icon cell — slightly darker pill on the left */}
      <span
        className={cn(
          'flex h-full items-center px-2.5',
          'border-r border-white/15',
          !isDisabled && 'bg-black/10 group-hover:bg-black/15',
          'transition-colors duration-200',
        )}
      >
        <RefreshCw
          className={cn(
            'size-3.5 transition-transform duration-300',
            isPending ? 'animate-spin' : 'group-hover:rotate-180',
          )}
        />
      </span>

      {/* Label */}
      <span className='px-3'>{isPending ? 'Queuing…' : 'Reprocess Batch'}</span>
    </button>
  );
}
