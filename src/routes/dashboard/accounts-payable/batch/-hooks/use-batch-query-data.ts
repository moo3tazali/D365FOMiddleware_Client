import { useParams } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import type { PaginationRes } from '@/interfaces/api-res';
import type { TDataBatch } from '@/interfaces/data-batch';

export const useBatchQueryData = (): [
  value: TDataBatch | undefined,
  setValue: (newBatch: TDataBatch) => void
] => {
  const queryClient = useQueryClient();

  const { batchId } = useParams({
    strict: false,
  });

  const { dataBatch } = useServices();

  const { data } = useSuspenseQuery(
    dataBatch.freightDocumentByIdQueryOptions(batchId)
  );

  const value = useMemo(
    () => data.items.find((item) => item.id === batchId),
    [data.items, batchId]
  );

  const setValue = useCallback(
    (newBatch: TDataBatch): void => {
      const newQueryKey = [
        ...dataBatch.queryKey,
        { batchNumber: newBatch.id, maxCount: 1, skipCount: 0 },
      ];
      queryClient.setQueryData<PaginationRes<TDataBatch>>(newQueryKey, {
        pageNumber: 1,
        totalCount: 1,
        pageSize: 1,
        items: [newBatch],
      });
    },
    [dataBatch.queryKey, queryClient]
  );

  if (!data || !batchId) return [undefined, setValue];

  return [value, setValue];
};
