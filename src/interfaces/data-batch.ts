import type { z } from 'zod';
import type { TPaginationSearchQuery } from './search-query';
import type { DataBatchFilterSchema } from '@/schemas/data-batch';

export enum TEntryProcessorTypes {
  AccountReceivableFreight = 1,
  AccountReceivableTrucking = 2,
  AccountReceivableFreightCreditNote = 3,
  AccountReceivableTruckingCreditNote = 4,
  LedgerFreightClosingEntry = 5,
  LedgerTruckingClosingEntry = 6,
  LedgerFreightVendorEntry = 7,
}

export enum TDataBatchStatus {
  Pending = 1,
  Processing = 2,
  Completed = 3,
  Canceled = 4,
}

export interface TDataBatch {
  id: string;
  creationDate: string; // ISO date string
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
  notes?: string;
  sourceRequest?: string;
  entryProcessorType: TEntryProcessorTypes;
  billingClassificationCode: number;
  targetService: number;
  description?: string;
  successCount: number;
  errorCount: number;
  totalUploadedCount: number;
  totalFormattedCount: number;
  status: TDataBatchStatus;
}

export type TDataBatchFilter = z.infer<typeof DataBatchFilterSchema>;

export interface IDataBatchQuery
  extends TPaginationSearchQuery,
    TDataBatchFilter {}
