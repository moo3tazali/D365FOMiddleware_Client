import { useCallback } from 'react';
import { useParams } from '@tanstack/react-router';

import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { useParsedPagination } from '@/hooks/use-parsed-pagination';

export const useSubmitBatch = () => {
  const { refetch } = useInvalidate();
  const { dataBatch } = useServices();

  const batchNumber = useParams({
    from: '/dashboard/accounts-payable/batch/$batchId',
  }).batchId;

  const defaultPagination = useParsedPagination();

  const { mutate, isPending } = useMutation({
    operationName: 'submit batch',
    mutationFn: dataBatch.insertBatch,
    refetchQueries: [
      [...dataBatch.queryKey, { batchNumber }],
      [...dataBatch.getQueryKey('accountPayable', defaultPagination)],
    ],
    onSuccess: () => {
      refetch(dataBatch.queryKey);
    },
  });

  const onSubmit = useCallback(
    (values: TDataBatch) => {
      mutate({
        batchId: values.id,
        skipErrors: true,
      });
    },
    [mutate],
  );

  return { onSubmit, isPending };
};
