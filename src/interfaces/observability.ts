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
