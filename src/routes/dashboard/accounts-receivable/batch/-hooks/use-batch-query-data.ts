import { useSearch } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import type { PaginationRes } from '@/interfaces/api-res';
import type { TDataBatch } from '@/interfaces/data-batch';

export const useBatchQueryData = (): [
  value: TDataBatch | undefined,
  setValue: (newBatch: TDataBatch) => void
] => {
  const queryClient = useQueryClient();

  const { batchId } = useSearch({
    from: '/dashboard/accounts-receivable/batch/',
  });

  const { dataBatch } = useServices();

  const { data } = useSuspenseQuery(
    dataBatch.freightDocumentQueryOptions({
      page: 1,
      size: 1,
      batchNumber: batchId,
    })
  );

  const setValue = useCallback(
    (newBatch: TDataBatch): void => {
      const newQueryKey = [
        dataBatch.queryKey,
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

  const value = data.items.find((item) => item.id === batchId);

  return [value, setValue];
};
