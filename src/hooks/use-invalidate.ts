import { useQueryClient } from '@tanstack/react-query';

export const useInvalidate = () => {
  const queryClient = useQueryClient();

  const invalidate = (queryKey: readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  };

  return { invalidate };
};
