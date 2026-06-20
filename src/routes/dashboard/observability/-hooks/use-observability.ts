import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/hooks/use-services';

export const useObservability = () => {
  const { observability } = useServices();
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState(
    () => new URLSearchParams(window.location.search).get('batchId') ?? ''
  );
  const [level, setLevel] = useState('');
  const logsQuery = useQuery(
    observability.logsQueryOptions({ search, batchId, level, limit: 100 })
  );
  const queuesQuery = useQuery(observability.queuesQueryOptions());

  return {
    search,
    setSearch,
    batchId,
    setBatchId,
    level,
    setLevel,
    logs: logsQuery.data?.items,
    isLoadingLogs: logsQuery.isLoading,
    queues: queuesQuery.data?.queues,
    jobs: queuesQuery.data?.jobs,
    refetchLogs: () => void logsQuery.refetch(),
  };
};
