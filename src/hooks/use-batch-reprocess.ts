import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import { TDataBatchStatus, type TDataBatch } from '@/interfaces/data-batch';

export function useBatchReprocess(batch?: TDataBatch) {
  const { dataBatch, dataBatchError } = useServices();
  const { invalidate } = useInvalidate();
  const user = useAuth((state) => state.user);
  const isOwnerOrAdmin =
    user?.role === 'ADMIN' ||
    (Boolean(user?.id) && batch?.createdByUserId === user?.id);
  const shouldCheckRemediations =
    Boolean(batch) &&
    isOwnerOrAdmin &&
    batch?.status === TDataBatchStatus.PendingPosting &&
    !['queued', 'active'].includes(batch.lastReprocessStatus ?? '');
  const remediationReadiness = useRemediationReadiness(
    batch,
    shouldCheckRemediations,
  );
  const disabledReason = getReprocessDisabledReason(
    batch,
    isOwnerOrAdmin,
    remediationReadiness,
  );

  const mutation = useMutation({
    operationName: 'reprocess batch',
    mutationFn: () => dataBatch.reprocess(batch!.id),
    toastMsgs: {
      loading: 'Queuing batch reprocessing...',
      success: 'Batch reprocessing queued.',
    },
    onSuccess: () => {
      invalidate(dataBatch.queryKey);
      invalidate(dataBatchError.queryKey);
    },
  });

  return {
    canReprocess: disabledReason === undefined,
    disabledReason,
    isPending: mutation.isPending,
    reprocess: mutation.mutate,
  };
}

interface RemediationReadiness {
  isPending: boolean;
  isError: boolean;
  hasUncreatedRecords: boolean;
}

function useRemediationReadiness(
  batch: TDataBatch | undefined,
  enabled: boolean,
): RemediationReadiness {
  const { dataBatch } = useServices();
  const summary = useQuery({
    ...dataBatch.remediationSummaryQueryOptions(batch?.id ?? ''),
    enabled,
  });
  const createdRecords = useQuery({
    queryKey: [
      ...dataBatch.queryKey,
      'missing-master-data',
      batch?.id,
      'created-count',
    ],
    queryFn: () =>
      dataBatch.getMissingMasterData(batch!.id, {
        creationStatus: 'created',
        limit: 1,
      }),
    enabled,
  });
  const totalRemediations = summary.data?.total ?? 0;
  const createdCount = createdRecords.data?.pagination.total ?? 0;
  return {
    isPending: enabled && (summary.isPending || createdRecords.isPending),
    isError: enabled && (summary.isError || createdRecords.isError),
    hasUncreatedRecords:
      enabled && !summary.isPending && createdCount < totalRemediations,
  };
}

function getReprocessDisabledReason(
  batch: TDataBatch | undefined,
  isOwnerOrAdmin: boolean,
  remediation: RemediationReadiness,
): string | undefined {
  if (!batch) return 'Batch details are still loading.';
  if (!isOwnerOrAdmin) {
    return 'Only the batch owner or an administrator can reprocess this batch.';
  }
  if (batch.lastReprocessStatus === 'queued') {
    return 'Batch reprocessing is already queued.';
  }
  if (batch.lastReprocessStatus === 'active') {
    return 'Batch reprocessing is already in progress.';
  }
  if (batch.status !== TDataBatchStatus.PendingPosting) {
    return reprocessStatusReason(batch.status);
  }
  if (remediation.isPending) {
    return 'Checking whether all remediation records are ready.';
  }
  if (remediation.isError) {
    return 'Remediation readiness could not be verified. Refresh and try again.';
  }
  if (remediation.hasUncreatedRecords) {
    return 'Create all missing customers before reprocessing the batch.';
  }
  return undefined;
}

function reprocessStatusReason(status: TDataBatchStatus): string {
  const reasons: Record<TDataBatchStatus, string> = {
    [TDataBatchStatus.PendingPosting]: '',
    [TDataBatchStatus.Posting]:
      'The batch cannot be reprocessed while it is posting.',
    [TDataBatchStatus.Posted]: 'A posted batch cannot be reprocessed.',
    [TDataBatchStatus.Canceled]: 'A canceled batch cannot be reprocessed.',
    [TDataBatchStatus.Revalidating]:
      'Batch reprocessing is already in progress.',
    [TDataBatchStatus.Processing]:
      'The batch is currently being processed.',
  };
  return reasons[status];
}
