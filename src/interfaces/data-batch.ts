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
  billingCodeId?: string;
  apiServiceType: number;
  creationDate: string; // ISO date string
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
  notes?: string;
  entryProcessorType: TEntryProcessorTypes;
  description?: string;
  successCount: number;
  errorCount: number;
  totalFormattedCount: number;
  totalUploadedCount: number;
  status: TDataBatchStatus;
}
