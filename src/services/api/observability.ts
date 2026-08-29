import { queryOptions } from '@tanstack/react-query';

import type {
  DurableQueueJob,
  InFlightPosting,
  OperationalLog,
  QueueStats,
  RedisQueueSnapshot,
} from '@/interfaces/observability';
import { API_ROUTES } from '@/services/core/api-routes';
import { sync } from '@/services/core/sync';

export interface LogFilters {
  level?: string;
  search?: string;
  batchId?: string;
  jobId?: string;
  correlationId?: string;
  before?: string;
  limit?: number;
}

export interface ExplorerLogFilters {
  page?: number;
  limit?: number;
  level?: string;
  from?: string;
  to?: string;
  search?: string;
  method?: string;
  route?: string;
  status?: string;
  queue?: string;
  jobId?: string;
  batchId?: string;
  requestId?: string;
  eventType?: string;
  /** 'true' keeps only events that carry a captured request/response body. */
  hasPayload?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface QueueJobFilters {
  page?: number;
  limit?: number;
  status?: string;
  jobId?: string;
  batchId?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ExplorerLogsResponse {
  data: OperationalLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    total: number;
    error: number;
    warn: number;
    info: number;
  };
}

export class Observability {
  private readonly sync = sync;

  listLogs(filters: LogFilters = {}) {
    return this.sync.fetch<{
      items: OperationalLog[];
      nextCursor: string | null;
    }>(API_ROUTES.ADMIN.OBSERVABILITY.LOGS, {
      query: { ...filters },
    });
  }

  deleteLog(eventId: string) {
    return this.sync.del<{
      status: string;
      eventId: string;
      deletedCount: number;
    }>(API_ROUTES.ADMIN.OBSERVABILITY.LOG, {
      params: { eventId },
    });
  }

  clearLiveLogs(filters: LogFilters & { confirmAll?: string } = {}) {
    return this.sync.del<{ status: string; deletedCount: number }>(
      API_ROUTES.ADMIN.OBSERVABILITY.LOGS_CLEAR,
      { query: { ...filters } },
    );
  }

  listExplorerLogs(filters: ExplorerLogFilters = {}) {
    return this.sync.fetch<ExplorerLogsResponse>(
      API_ROUTES.ADMIN.OBSERVABILITY.EXPLORER_LOGS,
      {
        query: { ...filters },
      },
    );
  }

  clearExplorerLogs(
    filters: ExplorerLogFilters & { confirmAll?: string } = {},
  ) {
    return this.sync.del<{ status: string; deletedCount: number }>(
      API_ROUTES.ADMIN.OBSERVABILITY.EXPLORER_LOGS_CLEAR,
      { query: { ...filters } },
    );
  }

  listQueues() {
    return this.sync.fetch<{
      queues: QueueStats[];
      jobs: DurableQueueJob[];
    }>(API_ROUTES.ADMIN.OBSERVABILITY.QUEUES);
  }

  /** Postings that have not finished, with the pause state of their batch. */
  listInFlightPostings() {
    return this.sync.fetch<InFlightPosting[]>(
      API_ROUTES.ADMIN.OBSERVABILITY.POSTINGS,
    );
  }

  inFlightPostingsQueryOptions() {
    return queryOptions({
      queryKey: ['admin.observability.postings'],
      queryFn: () => this.listInFlightPostings(),
      refetchInterval: 5_000,
    });
  }

  logsQueryOptions(filters: LogFilters) {
    return queryOptions({
      queryKey: ['admin.observability.logs', filters],
      queryFn: () => this.listLogs(filters),
    });
  }

  explorerLogsQueryOptions(filters: ExplorerLogFilters) {
    return queryOptions({
      queryKey: ['admin.observability.explorerLogs', filters],
      queryFn: () => this.listExplorerLogs(filters),
    });
  }

  queuesQueryOptions() {
    return queryOptions({
      queryKey: ['admin.observability.queues'],
      queryFn: () => this.listQueues(),
      refetchInterval: 5_000,
    });
  }

  getQueueDetail(queueName: string) {
    return this.sync.fetch<{
      queueName: string;
      stats: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
      };
      isPaused: boolean;
      redisJobs?: RedisQueueSnapshot;
    }>(API_ROUTES.ADMIN.OBSERVABILITY.QUEUES_DETAIL, {
      params: { queueName },
    });
  }

  pauseQueue(queueName: string) {
    return this.sync.save<{ status: string }>(
      API_ROUTES.ADMIN.OBSERVABILITY.QUEUES_PAUSE,
      {},
      { params: { queueName } },
    );
  }

  resumeQueue(queueName: string) {
    return this.sync.save<{ status: string }>(
      API_ROUTES.ADMIN.OBSERVABILITY.QUEUES_RESUME,
      {},
      { params: { queueName } },
    );
  }

  /** Permanently clear BullMQ + durable jobs for a queue. */
  cleanQueue(
    queueName: string,
    scope: 'failed' | 'completed' | 'waiting' | 'active' | 'all',
  ) {
    return this.sync.save<{
      status: string;
      scope: string;
      redis: Record<string, number>;
      durablePurged: number;
    }>(
      API_ROUTES.ADMIN.OBSERVABILITY.QUEUES_CLEAN,
      {},
      { params: { queueName }, query: { scope } },
    );
  }

  releaseOrphanedJobs(queueName: string) {
    return this.sync.save<{
      status: string;
      released: Array<{
        queueName: string;
        jobId: string;
        batchId?: string;
        mongoStatus: string;
      }>;
      restored: string[];
      redisJobs: RedisQueueSnapshot;
    }>(
      API_ROUTES.ADMIN.OBSERVABILITY.QUEUES_RELEASE_ORPHANS,
      {},
      { params: { queueName } },
    );
  }

  listQueueJobs(queueName: string, filters: QueueJobFilters = {}) {
    return this.sync.fetch<{
      data: DurableQueueJob[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>(API_ROUTES.ADMIN.OBSERVABILITY.QUEUES_JOBS, {
      params: { queueName },
      query: { ...filters },
    });
  }

  getJobDetail(queueName: string, jobId: string) {
    return this.sync.fetch<{
      durableJob: DurableQueueJob & {
        company: string;
        correlationId: string;
        sourceModule: string;
        journalKind?: string;
        cashDirection?: string;
        payloadVersion: number;
      };
      redisState: string;
      progress: number | null;
      failedReason: string | null;
      data: unknown;
      returnValue: unknown;
      stacktrace: string[] | null;
    }>(API_ROUTES.ADMIN.OBSERVABILITY.JOB, {
      params: { queueName, jobId },
    });
  }

  retryJob(queueName: string, jobId: string) {
    return this.sync.save<{ status: string }>(
      API_ROUTES.ADMIN.OBSERVABILITY.JOB_RETRY,
      {},
      { params: { queueName, jobId } },
    );
  }

  deleteJob(queueName: string, jobId: string) {
    return this.sync.del<{ status: string }>(
      API_ROUTES.ADMIN.OBSERVABILITY.JOB_DELETE,
      { params: { queueName, jobId } },
    );
  }

  queueDetailQueryOptions(queueName: string) {
    return queryOptions({
      queryKey: ['admin.observability.queueDetail', queueName],
      queryFn: () => this.getQueueDetail(queueName),
    });
  }

  queueJobsQueryOptions(queueName: string, filters: QueueJobFilters) {
    return queryOptions({
      queryKey: ['admin.observability.queueJobs', queueName, filters],
      queryFn: () => this.listQueueJobs(queueName, filters),
    });
  }
}
