import { useAuth } from '@/hooks/use-auth';
import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';

export function useBatchReprocess(batch?: TDataBatch) {
  const { dataBatch, dataBatchError } = useServices();
  const { invalidate } = useInvalidate();
  const user = useAuth((state) => state.user);
  const canReprocess =
    user?.role === 'ADMIN' ||
    (Boolean(user?.id) && batch?.createdByUserId === user?.id);

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
    canReprocess,
    isPending: mutation.isPending,
    reprocess: mutation.mutate,
  };
}
