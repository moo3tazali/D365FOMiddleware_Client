import { useParams } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import type { PaginationRes } from '@/interfaces/api-res';
import type { TDataBatch } from '@/interfaces/data-batch';

export const useBatchQueryData = (): [
  value: TDataBatch | undefined,
  setValue: (newBatch: TDataBatch) => Promise<void>,
] => {
  const queryClient = useQueryClient();

  const { batchId } = useParams({
    strict: false,
  });

  const { dataBatch } = useServices();

  const { data } = useSuspenseQuery(dataBatch.batchByIdQueryOptions(batchId));

  const value = useMemo(
    () => data?.items.find((item) => item.id === batchId),
    [data?.items, batchId],
  );

  const setValue = useCallback(
    async (newBatch: TDataBatch): Promise<void> => {
      const batchQueryKey = [...dataBatch.queryKey, { batchId: newBatch.id }];
      
      // Set the query data synchronously
      queryClient.setQueryData<PaginationRes<TDataBatch>>(batchQueryKey, {
        pageNumber: 1,
        totalCount: 1,
        pageSize: 1,
        totalPages: 1,
        items: [newBatch],
      });
      
      // Ensure the query is marked as fresh and await invalidation
      await queryClient.invalidateQueries({ 
        queryKey: batchQueryKey,
        refetchType: 'none' 
      });
      
      // Invalidate the list queries to update the batch list
      await queryClient.invalidateQueries({ 
        queryKey: dataBatch.queryKey,
        exact: false 
      });
    },
    [dataBatch.queryKey, queryClient],
  );

  if (!data || !batchId) return [undefined, setValue];

  return [value, setValue];
};
