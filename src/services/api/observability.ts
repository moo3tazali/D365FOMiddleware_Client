import { queryOptions } from '@tanstack/react-query';

import type {
  DurableQueueJob,
  OperationalLog,
  QueueStats,
} from '@/interfaces/observability';
import { API_ROUTES } from '@/services/core/api-routes';
import { Sync } from '@/services/core/sync';

export interface LogFilters {
  level?: string;
  search?: string;
  batchId?: string;
  jobId?: string;
  correlationId?: string;
  before?: string;
  limit?: number;
}

export class Observability {
  private readonly sync = Sync.getInstance();

  listLogs(filters: LogFilters = {}) {
    return this.sync.fetch<{
      items: OperationalLog[];
      nextCursor: string | null;
    }>(API_ROUTES.ADMIN.OBSERVABILITY.LOGS, {
      query: { ...filters },
    });
  }

  listQueues() {
    return this.sync.fetch<{
      queues: QueueStats[];
      jobs: DurableQueueJob[];
    }>(API_ROUTES.ADMIN.OBSERVABILITY.QUEUES);
  }

  logsQueryOptions(filters: LogFilters) {
    return queryOptions({
      queryKey: ['admin.observability.logs', filters],
      queryFn: () => this.listLogs(filters),
      refetchInterval: 5_000,
    });
  }

  queuesQueryOptions() {
    return queryOptions({
      queryKey: ['admin.observability.queues'],
      queryFn: () => this.listQueues(),
      refetchInterval: 5_000,
    });
  }
}
