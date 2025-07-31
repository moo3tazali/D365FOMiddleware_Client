import { useCallback } from 'react';
import { useParams } from '@tanstack/react-router';

import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';

export const useSubmitBatch = () => {
  const { dataBatch } = useServices();

  const batchNumber = useParams({
    from: '/dashboard/accounts-payable/batch/$batchId',
  }).batchId;

  const { mutate, isPending } = useMutation({
    operationName: 'submit batch',
    mutationFn: dataBatch.insertBatch,
    refetchQueries: [[...dataBatch.queryKey, { batchNumber }]],
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
