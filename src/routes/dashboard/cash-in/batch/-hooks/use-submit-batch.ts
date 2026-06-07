import { useCallback } from 'react';
import { useParams } from '@tanstack/react-router';

import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { useParsedPagination } from '@/hooks/use-parsed-pagination';

export const useSubmitBatch = () => {
  const { refetch } = useInvalidate();
  const { cashIn, dataBatch } = useServices();

  const batchNumber = useParams({
    from: '/dashboard/cash-in/batch/$batchId',
  }).batchId;

  const defaultPagination = useParsedPagination();

  const { mutate, isPending } = useMutation({
    operationName: 'submit batch',
    mutationFn: (batchId: string) => cashIn.postToDFO(batchId),
    refetchQueries: [
      [...dataBatch.queryKey, { batchNumber }],
      [...dataBatch.getQueryKey('cashIn', defaultPagination)],
    ],
    onSuccess: () => {
      refetch(dataBatch.queryKey);
    },
  });

  const onSubmit = useCallback(
    (values: TDataBatch) => {
      mutate(values.id);
    },
    [mutate]
  );

  return { onSubmit, isPending };
};
