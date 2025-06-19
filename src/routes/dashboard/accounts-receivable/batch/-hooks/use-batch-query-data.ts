import { useSearch } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';

import type { PaginationRes } from '@/interfaces/api-res';
import type { TDataBatch } from '@/interfaces/data-batch';

export const useBatchQueryData = (): TDataBatch | undefined => {
  const queryClient = useQueryClient();

  const { batchId } = useSearch({
    from: '/dashboard/accounts-receivable/batch/',
  });

  const { dataBatch } = useServices();

  const queryData = queryClient.getQueriesData({
    predicate: (query) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query.queryKey?.[1] as any)?.batchNumber === batchId &&
      query.queryKey?.[0] === dataBatch.queryKey,
  })?.[0]?.[1] as PaginationRes<TDataBatch> | undefined;

  if (!queryData) return;

  return queryData.items[0];
};
