import toast from 'react-hot-toast';
import { useNavigate } from '@tanstack/react-router';

import { useAuth } from '@/hooks/use-auth';
import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import {
  TDataBatchStatus,
  type TDataBatch,
} from '@/interfaces/data-batch';
import { ROUTES } from '@/router';

/**
 * Hard-delete a batch and discard its posting work, even if a worker is
 * currently posting. The journal in flight may still finish in D365FO; further
 * journals are stopped and the local batch is removed.
 */
export function useBatchDelete(
  batch?: TDataBatch,
  options?: { navigateAway?: boolean },
) {
  const { dataBatch } = useServices();
  const { invalidate } = useInvalidate();
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);

  const isOwnerOrAdmin =
    user?.role === 'ADMIN' ||
    (Boolean(user?.id) && batch?.createdByUserId === user?.id);
  const disabledReason = getDisabledReason(batch, isOwnerOrAdmin);

  const mutation = useMutation<void, void>({
    operationName: 'delete batch',
    mutationFn: () => dataBatch.deleteBatch({ batchId: batch!.id }),
    disableToast: true,
    onSuccess: () => {
      invalidate(dataBatch.queryKey);
      invalidate(['admin.observability.postings']);
      invalidate(['admin.observability.queues']);
      invalidate(['cash-posting-queue']);
      toast.success(`Batch ${batch!.id} deleted.`, { duration: 5000 });
      if (options?.navigateAway) {
        void navigate({ to: ROUTES.DASHBOARD.CASH_OUT.HOME });
      }
    },
    onError: (error) => {
      toast.error(error.message ?? 'Could not delete the batch.');
    },
  });

  return {
    canDelete: disabledReason === undefined,
    disabledReason,
    isPending: mutation.isPending,
    deleteBatch: () => {
      if (!batch) return;
      const warning =
        batch.status === TDataBatchStatus.Posted
          ? `Delete posted batch ${batch.id} from the middleware? D365FO journals will NOT be deleted. This cannot be undone.`
          : batch.status === TDataBatchStatus.Posting || batch.postingPaused
          ? `Delete batch ${batch.id} even if it is posting? Queue work is discarded and further journals stop. The journal being written right now may still finish in D365FO. Journals already created there are not removed. This cannot be undone.`
          : `Delete batch ${batch.id} and all of its records? This cannot be undone.`;
      if (window.confirm(warning)) mutation.mutate();
    },
  };
}

function getDisabledReason(
  batch: TDataBatch | undefined,
  isOwnerOrAdmin: boolean,
): string | undefined {
  if (!batch) return 'Batch details are still loading.';
  if (!isOwnerOrAdmin) {
    return 'Only the batch owner or an administrator can delete this batch.';
  }
  return undefined;
}
