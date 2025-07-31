import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { useCallback } from 'react';

export const useSubmitBatch = () => {
  const { dataBatch } = useServices();

  const { mutate, isPending } = useMutation({
    operationName: 'submit batch',
    mutationFn: dataBatch.insertBatch,
  });

  const onSubmit = useCallback(
    (values: TDataBatch) => {
      mutate({
        batchId: values.id,
        skipErrors: true,
      });
    },
    [mutate]
  );

  return { onSubmit, isPending };
};
