import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';
import type { TDataBatch } from '@/interfaces/data-batch';

export const useDataBatchAction = (data: TDataBatch) => {
  const { dataBatch } = useServices();

  const { mutateAsync: onDownload } = useMutation({
    operationName: 'download record',
    mutationFn: () =>
      dataBatch.downloadEnhancedRecordList({ batchId: data.id }),
  });

  return { onDownload };
};
