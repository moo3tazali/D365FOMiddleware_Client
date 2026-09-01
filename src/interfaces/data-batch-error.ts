export interface TDataBatchErrorEnhancedError {
  property: string;
  message: string;
}

export interface TDataBatchError {
  id: string;
  batchId: string;
  sourceRecordIds: string[];
  errorMessages: string[];
  accountDimensionsModel: {
    mainAccount: string;
    costCenter: string;
    activityName: string;
    businessUnit: string;
    location: string;
    customer: string;
    subCustomer: string;
    vendor: string;
    subVendor: string;
    chargeType: string;
    salesMan: string;
    coordinatorMan: string;
    freightType: string;
    truckerType: string;
    truckNumber: string;
    direction: string;
    worker: string;
    fixedAsset: string;
    lease: string;
  };
  enhancedRecordIds: string[];
  /** When present, provides structured errors (property + message) for display */
  enhancedData?: {
    errors?: TDataBatchErrorEnhancedError[];
    LineNumber?: number;
    Voucher?: string;
    [key: string]: unknown;
  };
}

/** One row in the batch error table: unique source IDs with deduplicated error messages */
export interface GroupedBatchError {
  sourceRecordIds: string[];
  errorMessages: string[];
  /** Structured errors when available (e.g. from enhancedData) */
  errorsByProperty?: TDataBatchErrorEnhancedError[];
  /** Number of raw records collapsed into this group */
  occurrenceCount: number;
}

/** One row when grouping by error message: one message, all affected source IDs */
export interface GroupedByMessageError {
  property: string;
  message: string;
  sourceRecordIds: string[];
  excelLineNumbers?: number[];
}
