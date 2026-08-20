import { useParams } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import type { PaginationRes } from '@/interfaces/api-res';
import { TDataBatchStatus, type TDataBatch } from '@/interfaces/data-batch';

export const useBatchQueryData = (): [
  value: TDataBatch | undefined,
  setValue: (newBatch: TDataBatch) => void,
] => {
  const queryClient = useQueryClient();

  const { batchId } = useParams({
    strict: false,
  });

  const { dataBatch } = useServices();

  const { data } = useSuspenseQuery({
    ...dataBatch.batchByIdQueryOptions(batchId),
    refetchInterval: (query) => {
      const currentBatch = query.state.data?.items?.[0];
      return currentBatch?.status === TDataBatchStatus.Processing
        ? 3000
        : false;
    },
  });

  const value = useMemo(
    () => data?.items.find((item) => item.id === batchId),
    [data?.items, batchId],
  );

  const setValue = useCallback(
    (newBatch: TDataBatch): void => {
      const batchQueryKey = [...dataBatch.queryKey, { batchId: newBatch.id }];
      queryClient.setQueryData<PaginationRes<TDataBatch>>(batchQueryKey, {
        pageNumber: 1,
        totalCount: 1,
        pageSize: 1,
        totalPages: 1,
        items: [newBatch],
      });
      queryClient.invalidateQueries({ queryKey: dataBatch.queryKey });
    },
    [dataBatch.queryKey, queryClient],
  );

  if (!data || !batchId) return [undefined, setValue];

  return [value, setValue];
};
