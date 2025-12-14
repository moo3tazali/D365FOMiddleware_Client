import type { SyncType } from '@/services/api/master-data';

export enum SyncJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface IMasterDataSyncStatus {
  syncType: SyncType;
  label: string;
  status: SyncJobStatus;
  errorMessage?: string;
}

export interface IMasterDataSyncJobResponse {
  id: string;
  name: string;
  status: SyncJobStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
