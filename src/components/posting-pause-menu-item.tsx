import { TableActionCol } from '@/components/table-action-col';
import { useBatchPostingPause } from '@/hooks/use-batch-posting-pause';
import { TDataBatchStatus, type TDataBatch } from '@/interfaces/data-batch';

/**
 * Row action that holds a batch back from being posted to D365FO, or lets it
 * continue. Pausing a batch that is already posting stops it after the journal
 * the worker is currently writing.
 */
export function PostingPauseMenuItem({ batch }: { batch: TDataBatch }) {
  const { isPaused, canToggle, disabledReason, isPending, pause, resume } =
    useBatchPostingPause(batch);

  return (
    <TableActionCol.PausePosting
      paused={isPaused}
      disabled={!canToggle || isPending}
      title={disabledReason}
      onClick={() => {
        if (isPaused) {
          resume();
          return;
        }
        const warning =
          batch.status === TDataBatchStatus.Posting
            ? `Pause posting batch ${batch.id}? The journal being written right now is finished first, then the remaining journals wait until you resume.`
            : `Pause posting batch ${batch.id}? It cannot be sent to D365FO until you resume.`;
        if (window.confirm(warning)) pause();
      }}
    >
      {isPaused ? 'Resume Posting' : 'Pause Posting'}
    </TableActionCol.PausePosting>
  );
}
