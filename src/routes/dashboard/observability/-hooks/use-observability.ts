import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/hooks/use-services';
import type { ExplorerLogFilters } from '@/services/api/observability';

export const useObservability = () => {
  const { observability } = useServices();

  // Active Tab: 'live' | 'explorer'
  const [activeTab, setActiveTab] = useState<'live' | 'explorer'>('live');

  // --- LIVE MODE STATES ---
  const [liveSearch, setLiveSearch] = useState('');
  const [liveBatchId, setLiveBatchId] = useState(
    () => new URLSearchParams(window.location.search).get('batchId') ?? '',
  );
  const [liveLevel, setLiveLevel] = useState('');
  const [liveAutoRefresh, setLiveAutoRefresh] = useState(true);

  // Live Query
  const liveLogsQuery = useQuery({
    ...observability.logsQueryOptions({
      search: liveSearch,
      batchId: liveBatchId,
      level: liveLevel,
      limit: 100,
    }),
    refetchInterval: liveAutoRefresh ? 5_000 : false,
  });

  // --- EXPLORER MODE STATES ---
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerRoute, setExplorerRoute] = useState('');
  const [explorerBatchId, setExplorerBatchId] = useState(
    () => new URLSearchParams(window.location.search).get('batchId') ?? '',
  );
  const [explorerJobId, setExplorerJobId] = useState('');
  const [explorerRequestId, setExplorerRequestId] = useState('');
  const [explorerLevel, setExplorerLevel] = useState('');
  const [explorerMethod, setExplorerMethod] = useState('');
  const [explorerStatus, setExplorerStatus] = useState('');
  const [explorerQueue, setExplorerQueue] = useState('');
  const [timePreset, setTimePreset] = useState<string>('24h');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [fromState, setFromState] = useState<string>('');
  const [toState, setToState] = useState<string>('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Debouncing for search and route paths (400ms)
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedRoute, setDebouncedRoute] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(explorerSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [explorerSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRoute(explorerRoute);
    }, 400);
    return () => clearTimeout(handler);
  }, [explorerRoute]);

  // Compute from/to dates based on preset
  const updateExplorerDates = useCallback(
    (preset: string, rawFrom?: string, rawTo?: string) => {
      const now = new Date();
      if (preset === '1h') {
        setFromState(new Date(now.getTime() - 60 * 60 * 1000).toISOString());
        setToState(now.toISOString());
      } else if (preset === '24h') {
        setFromState(
          new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        );
        setToState(now.toISOString());
      } else if (preset === '7d') {
        setFromState(
          new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        );
        setToState(now.toISOString());
      } else if (preset === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        setFromState(todayStart.toISOString());
        setToState(now.toISOString());
      } else if (preset === 'yesterday') {
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);
        setFromState(yesterdayStart.toISOString());
        setToState(yesterdayEnd.toISOString());
      } else if (preset === 'custom') {
        setFromState(rawFrom ? new Date(rawFrom).toISOString() : '');
        setToState(rawTo ? new Date(rawTo).toISOString() : '');
      } else {
        setFromState('');
        setToState('');
      }
    },
    [],
  );

  // Update dates when preset or custom inputs change
  useEffect(() => {
    updateExplorerDates(timePreset, customFrom, customTo);
  }, [timePreset, customFrom, customTo, updateExplorerDates]);

  // Explorer Filters passed to React Query
  const explorerFilters = useMemo<ExplorerLogFilters>(() => {
    return {
      page,
      limit,
      level: explorerLevel || undefined,
      from: fromState || undefined,
      to: toState || undefined,
      search: debouncedSearch || undefined,
      method: explorerMethod || undefined,
      route: debouncedRoute || undefined,
      status: explorerStatus || undefined,
      queue: explorerQueue || undefined,
      jobId: explorerJobId || undefined,
      batchId: explorerBatchId || undefined,
      requestId: explorerRequestId || undefined,
      sortBy,
      sortDirection,
    };
  }, [
    page,
    limit,
    explorerLevel,
    fromState,
    toState,
    debouncedSearch,
    explorerMethod,
    debouncedRoute,
    explorerStatus,
    explorerQueue,
    explorerJobId,
    explorerBatchId,
    explorerRequestId,
    sortBy,
    sortDirection,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    explorerLevel,
    fromState,
    toState,
    debouncedSearch,
    explorerMethod,
    debouncedRoute,
    explorerStatus,
    explorerQueue,
    explorerJobId,
    explorerBatchId,
    explorerRequestId,
    sortBy,
    sortDirection,
  ]);

  // Explorer Query
  const explorerLogsQuery = useQuery(
    observability.explorerLogsQueryOptions(explorerFilters),
  );

  // Queues and jobs (polled every 5 seconds)
  const queuesQuery = useQuery(observability.queuesQueryOptions());

  // Manual refresh triggers
  const refetchLive = useCallback(() => {
    void liveLogsQuery.refetch();
  }, [liveLogsQuery]);

  const refetchExplorer = useCallback(() => {
    updateExplorerDates(timePreset, customFrom, customTo);
    void explorerLogsQuery.refetch();
  }, [
    explorerLogsQuery,
    timePreset,
    customFrom,
    customTo,
    updateExplorerDates,
  ]);

  // Clear explorer filters
  const clearExplorerFilters = useCallback(() => {
    setExplorerSearch('');
    setExplorerRoute('');
    setExplorerBatchId('');
    setExplorerJobId('');
    setExplorerRequestId('');
    setExplorerLevel('');
    setExplorerMethod('');
    setExplorerStatus('');
    setExplorerQueue('');
    setTimePreset('24h');
    setCustomFrom('');
    setCustomTo('');
    setPage(1);
    setSortBy('timestamp');
    setSortDirection('desc');
  }, []);

  return {
    // Tab Controller
    activeTab,
    setActiveTab,

    // Live Mode
    liveSearch,
    setLiveSearch,
    liveBatchId,
    setLiveBatchId,
    liveLevel,
    setLiveLevel,
    liveAutoRefresh,
    setLiveAutoRefresh,
    liveLogs: liveLogsQuery.data?.items,
    isLoadingLive: liveLogsQuery.isLoading,
    isRefetchingLive: liveLogsQuery.isRefetching,
    refetchLive,

    // Explorer Mode
    explorerSearch,
    setExplorerSearch,
    explorerRoute,
    setExplorerRoute,
    explorerBatchId,
    setExplorerBatchId,
    explorerJobId,
    setExplorerJobId,
    explorerRequestId,
    setExplorerRequestId,
    explorerLevel,
    setExplorerLevel,
    explorerMethod,
    setExplorerMethod,
    explorerStatus,
    setExplorerStatus,
    explorerQueue,
    setExplorerQueue,
    timePreset,
    setTimePreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    fromState,
    toState,
    page,
    setPage,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    explorerLogs: explorerLogsQuery.data?.data,
    explorerPagination: explorerLogsQuery.data?.pagination,
    explorerSummary: explorerLogsQuery.data?.summary,
    isLoadingExplorer: explorerLogsQuery.isLoading,
    isRefetchingExplorer: explorerLogsQuery.isRefetching,
    refetchExplorer,
    clearExplorerFilters,

    // Shared queues and jobs
    queues: queuesQuery.data?.queues,
    jobs: queuesQuery.data?.jobs,
    isLoadingQueues: queuesQuery.isLoading,
  };
};
