export enum TEntryProcessorTypes {
  AccountReceivableFreight = 1,
  AccountReceivableTrucking = 2,
  AccountReceivableFreightCreditNote = 3,
  AccountReceivableTruckingCreditNote = 4,
  LedgerFreightClosingEntry = 5,
  LedgerTruckingClosingEntry = 6,
  AccountPayableFreight = 7,
  AccountPayableTrucking = 8,
  CustodyFreight = 9,
  CustodyTrucking = 10,
  LedgerCashOut = 11,
  LedgerBankOut = 12,
  LedgerVisaOut = 13,
  LedgerCashIn = 14,
  LedgerBankIn = 15,
  LedgerVisaIn = 16,
  VendorFreight = 17,
  VendorTrucking = 18,
  VendorFreightAdjustment = 19,
  VendorTruckingAdjustment = 20,
  CashInFreight = 21,
  CashOutFreight = 22,
  LedgerCustodySettlement = 23,
  LedgerFreightClosingDifference = 24,
  VendorPaymentFreight = 25,
  VendorPaymentTrucking = 26,
  CashInTrucking = 27,
  CashOutTrucking = 28,
  AccountReceivableYard = 29,
}

export enum TDataBatchStatus {
  PendingPosting = 1,
  Posting = 2,
  Posted = 3,
  Canceled = 4,
  Revalidating = 5,
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
  expectedGroupCount?: number;
  dfoIds?: string[]; // Array of created D365FO group IDs
  dfoPostingErrors?: string[]; // Array of error messages from D365FO posting failures
  createdByUserId?: string;
  createdByName?: string;
  createdByEmail?: string;
  lastReprocessedAt?: string;
  lastReprocessedByUserId?: string;
  lastReprocessedByName?: string;
  lastReprocessedByEmail?: string;
  reprocessCount: number;
  lastReprocessJobId?: string;
  lastReprocessStatus?: 'queued' | 'active' | 'completed' | 'failed';
  lastReprocessError?: string;
}

export interface TDataBatchMissingMasterData {
  id: string;
  batchId: string;
  company: string;
  entryProcessorType: number;
  type: string;
  missingField: 'CustomerAccount' | 'TaxExemptNumber';
  missingValue: string;
  creationStatus: 'missing' | 'creating' | 'created' | 'create_failed';
  reprocessStatus:
    | 'not_started'
    | 'pending'
    | 'processing'
    | 'succeeded'
    | 'failed';
  affectedCount: number;
  formDefaults?: Record<string, unknown>;
  readonlyFormFields: string[];
  createdData?: Record<string, unknown>;
  createErrorMessage?: string;
  reprocessErrorMessage?: string;
  reprocessAttempts: number;
}

export interface TMissingMasterDataPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TMissingMasterDataPage {
  data: TDataBatchMissingMasterData[];
  pagination: TMissingMasterDataPaginationMeta;
}

export interface TRemediationTypeSummary {
  type: string;
  count: number;
  affectedRows: number;
}

export interface TRemediationSummary {
  total: number;
  types: TRemediationTypeSummary[];
}
