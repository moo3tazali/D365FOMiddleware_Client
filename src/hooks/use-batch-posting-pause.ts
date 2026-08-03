import toast from 'react-hot-toast';

import { useAuth } from '@/hooks/use-auth';
import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import {
  TDataBatchStatus,
  type TBatchPostingPauseState,
  type TDataBatch,
} from '@/interfaces/data-batch';

/**
 * Pause or resume the posting of one batch to D365FO.
 *
 * Pausing takes effect between journals: a worker that is already posting the
 * batch finishes the journal it is writing and stops before the next one, so
 * the journals it already created stay in D365FO and resuming continues with
 * the ones that are still pending.
 */
export function useBatchPostingPause(batch?: TDataBatch) {
  const { dataBatch } = useServices();
  const { invalidate } = useInvalidate();
  const user = useAuth((state) => state.user);

  const isOwnerOrAdmin =
    user?.role === 'ADMIN' ||
    (Boolean(user?.id) && batch?.createdByUserId === user?.id);
  const isPaused = Boolean(batch?.postingPaused);
  const disabledReason = getDisabledReason(batch, isOwnerOrAdmin);

  const mutation = useMutation<TBatchPostingPauseState, boolean>({
    operationName: 'change batch posting',
    mutationFn: (paused: boolean) =>
      paused
        ? dataBatch.pausePosting(batch!.id)
        : dataBatch.resumePosting(batch!.id),
    disableToast: true,
    onSuccess: (state) => {
      invalidate(dataBatch.queryKey);
      // Keep Observability's in-flight postings table in sync.
      invalidate(['admin.observability.postings']);
      toast.success(state.message, { duration: 6000 });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Could not change the posting state.');
    },
  });

  return {
    isPaused,
    canToggle: disabledReason === undefined,
    disabledReason,
    isPending: mutation.isPending,
    pause: () => mutation.mutate(true),
    resume: () => mutation.mutate(false),
    /** State returned by the last pause or resume, for the confirmation copy. */
    lastState: mutation.data,
  };
}

function getDisabledReason(
  batch: TDataBatch | undefined,
  isOwnerOrAdmin: boolean,
): string | undefined {
  if (!batch) return 'Batch details are still loading.';
  if (!isOwnerOrAdmin) {
    return 'Only the batch owner or an administrator can pause posting.';
  }
  if (batch.status === TDataBatchStatus.Posted) {
    return 'The batch is already posted to D365FO.';
  }
  if (batch.status === TDataBatchStatus.Revalidating && !batch.postingPaused) {
    return 'The batch is being revalidated and is not posting.';
  }
  return undefined;
}
