/** A captured request or response body, already redacted by the backend. */
export interface OperationalLogBodySnapshot {
  body: unknown;
  /** Size of the body before truncation, in bytes. */
  sizeBytes: number;
  truncated: boolean;
  redactedKeys?: string[];
  captureError?: string;
}

export interface OperationalLogPayload {
  request?: OperationalLogBodySnapshot;
  response?: OperationalLogBodySnapshot;
}

export interface OperationalLog {
  _id: string;
  eventId: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: string;
  eventType: string;
  correlationId?: string;
  requestId?: string;
  batchId?: string;
  jobId?: string;
  queueName?: string;
  status?: string;
  durationMs?: number;
  error?: { name?: string; message: string; stack?: string };
  metadata?: Record<string, unknown>;
  payload?: OperationalLogPayload;
}

export interface QueueStats {
  queueName: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  isPaused?: boolean;
}

/** A posting that has not finished, with the pause state of its batch. */
export interface InFlightPosting {
  batchId: string;
  jobId: string;
  queueName: string;
  jobStatus: string;
  sourceModule: string;
  company: string;
  completedGroups: number;
  totalGroups: number;
  paused: boolean;
  /** Paused, but the worker is still finishing the journal it started. */
  stopping: boolean;
  updatedAt?: string;
}

export interface RedisJobSnapshot {
  jobId: string;
  batchId?: string;
  state: string;
  timestamp?: number;
  processedOn?: number | null;
  finishedOn?: number | null;
  attemptsMade: number;
  failedReason: string | null;
}

export interface RedisQueueSnapshot {
  active: RedisJobSnapshot[];
  waiting: RedisJobSnapshot[];
  delayed: RedisJobSnapshot[];
  paused: RedisJobSnapshot[];
}

export interface DurableQueueJob {
  jobId: string;
  queueName: string;
  batchId: string;
  sourceModule: string;
  status: string;
  totalGroups: number;
  completedGroups: number;
  retryCount: number;
  heartbeatAt?: string;
  completedAt?: string;
  failedAt?: string;
  error?: string;
  createdAt: string;
}
