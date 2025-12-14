import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useInvalidate = () => {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    (queryKey: readonly unknown[]) => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === queryKey[0],
      });
    },
    [queryClient]
  );

  const refetch = useCallback(
    (queryKey: readonly unknown[]) => {
      queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === queryKey[0],
      });
    },
    [queryClient]
  );

  return { invalidate, refetch };
};
