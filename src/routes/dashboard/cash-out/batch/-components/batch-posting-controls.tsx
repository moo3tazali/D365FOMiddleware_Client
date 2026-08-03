import PauseIcon from 'lucide-react/dist/esm/icons/pause';
import PlayIcon from 'lucide-react/dist/esm/icons/play';
import TrashIcon from 'lucide-react/dist/esm/icons/trash-2';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatBatchDate } from '@/components/batch/batch-audit';
import { useBatchDelete } from '@/hooks/use-batch-delete';
import { useBatchPostingPause } from '@/hooks/use-batch-posting-pause';
import { TDataBatchStatus, type TDataBatch } from '@/interfaces/data-batch';
import { PostingQueueControls } from '../../-components/posting-queue-controls';

/**
 * Per-batch posting switch, next to the state of the whole upload queue.
 * Pausing here holds only this batch back; delete removes it and discards any
 * waiting or paused upload work. The queue control below holds every cash batch.
 */
export const BatchPostingControls = ({ batch }: { batch: TDataBatch }) => {
  const { isPaused, canToggle, disabledReason, isPending, pause, resume } =
    useBatchPostingPause(batch);
  const {
    canDelete,
    disabledReason: deleteDisabledReason,
    isPending: isDeleting,
    deleteBatch,
  } = useBatchDelete(batch, { navigateAway: true });

  if (batch.status === TDataBatchStatus.Posted) {
    return <PostingQueueControls />;
  }

  return (
    <div className='space-y-3'>
      <div
        className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
          isPaused
            ? 'border-amber-500/25 bg-amber-500/10 dark:border-amber-950/50 dark:bg-amber-950/20'
            : 'border-border'
        }`}
      >
        <div className='min-w-0 space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='font-medium'>Posting this batch</span>
            <Badge
              dot
              variant='ghost'
              color={isPaused ? 'warning' : 'success'}
            >
              {isPaused ? 'Paused' : 'Active'}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>{describe(batch, isPaused)}</p>
        </div>

        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          <PauseButton
            isPaused={isPaused}
            canToggle={canToggle}
            disabledReason={disabledReason}
            isPending={isPending || isDeleting}
            onPause={pause}
            onResume={resume}
            isPosting={batch.status === TDataBatchStatus.Posting}
          />
          <DeleteButton
            canDelete={canDelete}
            disabledReason={deleteDisabledReason}
            isPending={isDeleting || isPending}
            onDelete={deleteBatch}
          />
        </div>
      </div>

      <PostingQueueControls />
    </div>
  );
};

const DeleteButton = ({
  canDelete,
  disabledReason,
  isPending,
  onDelete,
}: {
  canDelete: boolean;
  disabledReason?: string;
  isPending: boolean;
  onDelete: () => void;
}) => {
  const button = (
    <Button
      variant='outline'
      className='shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
      disabled={!canDelete || isPending}
      onClick={onDelete}
    >
      <TrashIcon className='size-4' />
      Delete batch
    </Button>
  );

  if (canDelete) return button;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className='shrink-0'>{button}</span>
      </TooltipTrigger>
      <TooltipContent side='left'>{disabledReason}</TooltipContent>
    </Tooltip>
  );
};

const PauseButton = ({
  isPaused,
  canToggle,
  disabledReason,
  isPending,
  isPosting,
  onPause,
  onResume,
}: {
  isPaused: boolean;
  canToggle: boolean;
  disabledReason?: string;
  isPending: boolean;
  isPosting: boolean;
  onPause: () => void;
  onResume: () => void;
}) => {
  const button = (
    <Button
      variant={isPaused ? 'default' : 'destructive'}
      className='shrink-0'
      disabled={!canToggle || isPending}
      onClick={() => {
        if (isPaused) {
          onResume();
          return;
        }
        const warning = isPosting
          ? 'Pause posting this batch? The journal being written right now is finished first, then the remaining journals wait until you resume.'
          : 'Pause posting this batch? It cannot be sent to D365FO until you resume.';
        if (window.confirm(warning)) onPause();
      }}
    >
      {isPaused ? (
        <>
          <PlayIcon className='size-4 fill-current' />
          Resume posting
        </>
      ) : (
        <>
          <PauseIcon className='size-4 fill-current' />
          Pause posting
        </>
      )}
    </Button>
  );

  if (canToggle) return button;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className='shrink-0'>{button}</span>
      </TooltipTrigger>
      <TooltipContent side='left'>{disabledReason}</TooltipContent>
    </Tooltip>
  );
};

function describe(batch: TDataBatch, isPaused: boolean): string {
  if (!isPaused) {
    return batch.status === TDataBatchStatus.Posting
      ? 'The batch is being posted to D365FO journal by journal.'
      : 'The batch is free to be posted to D365FO.';
  }

  const by = [
    batch.postingPausedByName ? `by ${batch.postingPausedByName}` : '',
    batch.postingPausedAt ? `on ${formatBatchDate(batch.postingPausedAt)}` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const detail =
    batch.status === TDataBatchStatus.Posting
      ? 'Journals already posted are kept; the pending ones wait until you resume.'
      : 'It cannot be sent to D365FO until you resume.';

  return `Paused ${by}. ${detail}`.replace('Paused .', 'Paused.');
}
