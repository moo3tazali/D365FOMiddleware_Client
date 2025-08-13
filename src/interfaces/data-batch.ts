export enum TEntryProcessorTypes {
  AccountReceivableFreight = 1,
  AccountReceivableTrucking = 2,
  AccountReceivableFreightCreditNote = 3,
  AccountReceivableTruckingCreditNote = 4,
  LedgerFreightClosingEntry = 5,
  LedgerTruckingClosingEntry = 6,
  AccountPayableFreightVendorEntry = 7,
  AccountPayableTruckingVendorEntry = 8,
  LedgerCashOutEntry_1 = 11,
  LedgerCashOutEntry_2 = 12,
  LedgerCashOutEntry_3 = 13,
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
  skipErrors?: boolean;
}
