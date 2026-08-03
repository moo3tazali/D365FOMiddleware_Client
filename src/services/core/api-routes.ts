import type { FlattenObj } from '@/lib/utils';

export const API_ROUTES = {
  ADMIN: {
    ACCESS: {
      LIST: '/admin/access-requests',
      ONE: '/admin/access-requests/:userId',
      APPROVE: '/admin/access-requests/:userId/approve',
      REJECT: '/admin/access-requests/:userId/reject',
      REVOKE: '/admin/access-requests/:userId/revoke',
      RECONSIDER: '/admin/access-requests/:userId/reconsider',
    },
    OBSERVABILITY: {
      LOGS: '/admin/logs',
      LOG: '/admin/logs/:eventId',
      LOGS_CLEAR: '/admin/logs',
      EXPLORER_LOGS: '/observability/logs',
      EXPLORER_LOG: '/observability/logs/:eventId',
      EXPLORER_LOGS_CLEAR: '/observability/logs',
      QUEUES: '/admin/queues',
      POSTINGS: '/admin/queues/postings',
      QUEUES_DETAIL: '/admin/queues/:queueName',
      QUEUES_PAUSE: '/admin/queues/:queueName/pause',
      QUEUES_RESUME: '/admin/queues/:queueName/resume',
      QUEUES_CLEAN: '/admin/queues/:queueName/clean',
      QUEUES_JOBS: '/admin/queues/:queueName/jobs',
      JOB: '/admin/queues/:queueName/jobs/:jobId',
      JOB_RETRY: '/admin/queues/:queueName/jobs/:jobId/retry',
      JOB_DELETE: '/admin/queues/:queueName/jobs/:jobId',
    },
    APP_SETTING: {
      LIST: '/settings',
      ONE: '/settings/:logicalName',
      Update: '/settings/:logicalName',
    },
  },
  FINANCE: {
    MASTER_DATA: {
      SYNC_STATUS: '/FINANCE/MasterData/sync-status',
      CUSTOMERS: {
        GET: '/Finance/MasterData/customers',
        SYNC: '/Finance/MasterData/customers/sync',
        CREATE_FROM_MISSING:
          '/Finance/MasterData/customers/from-missing-data/:missingDataId',
      },
      FINANCIAL_DIMENSIONS: {
        GET: '/Finance/MasterData/financial-dimensions',
        SYNC: '/Finance/MasterData/financial-dimensions/sync',
      },

      BILLING_CLASSIFICATIONS: {
        GET: '/Finance/MasterData/billing-classifications',
      },

      BILLING_CODES: {
        GET: '/Finance/MasterData/billing-codes',
      },

      BILLING_DATA: {
        GET: '/Finance/MasterData/billing-data',
        SYNC: '/Finance/MasterData/billing-data/sync',
      },

      MAIN_ACCOUNTS: {
        GET: '/Finance/MasterData/main-accounts',
        SYNC: '/Finance/MasterData/main-accounts/sync',
      },

      ACCOUNT_MAPPINGS: {
        GET: '/Finance/MasterData/account-mappings',
        SAVE: '/Finance/MasterData/account-mappings',
      },

      VENDORS: {
        GET: '/Finance/MasterData/vendors',
        SYNC: '/Finance/MasterData/vendors/sync',
      },
      EXCHANGE_RATES: {
        GET: '/Finance/MasterData/exchange-rates',
        SYNC: '/Finance/MasterData/exchange-rates/sync',
      },
      PAYMENT_TERMS: {
        GET: '/Finance/MasterData/payment-terms',
        SYNC: '/Finance/MasterData/payment-terms/sync',
      },
      LEDGERS: {
        GET: '/Finance/MasterData/ledgers',
        SYNC: '/Finance/MasterData/ledgers/sync',
      },
      TAX_ITEM_GROUP_HEADINGS: {
        GET: '/Finance/MasterData/tax-item-group-headings',
        SYNC: '/Finance/MasterData/tax-item-group-headings/sync',
      },
    },
  },
  PUBLIC: {
    AUTH: {
      LOGIN: '/auth/login',
      MICROSOFT: '/auth/microsoft',
      MICROSOFT_EXCHANGE: '/auth/microsoft/exchange',
      ACCESS_STATUS: '/auth/access-status',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      LOGOUT_ALL: '/auth/logout-all',
    },
    USER: {
      ME: '/users/me',
      CHANGE_PASSWORD: '/users/me/change-password',
    },
  },
  DATA_MIGRATION: {
    DATA_BATCH: {
      LIST: '/DataMigration/DataBatch/list',
      ONE: '/DataMigration/DataBatch/:batchId',
      DOWNLOAD_ENHANCED_RECORD_LIST:
        '/DataMigration/DataBatch/download-enhanced-record-list',
      DOWNLOAD_BATCH_ERROR_LIST:
        '/DataMigration/DataBatch/download-batch-error-list',
      DOWNLOAD_SOURCE_FILE: '/DataMigration/DataBatch/download-source-file',
      ERROR_LIST: '/DataMigration/DataBatch/error-list',
      DELETE: '/DataMigration/DataBatch',
      INSERT: '/DataMigration/DataBatch/insert',
      MISSING_MASTER_DATA:
        '/DataMigration/DataBatch/:batchId/missing-master-data',
      REMEDIATION_SUMMARY:
        '/DataMigration/DataBatch/:batchId/remediation-summary',
      REPROCESS: '/DataMigration/DataBatch/:batchId/reprocess',
      POSTING_PAUSE: '/DataMigration/DataBatch/:batchId/posting/pause',
      POSTING_RESUME: '/DataMigration/DataBatch/:batchId/posting/resume',
    },
    ACCOUNT_RECEIVABLE: {
      FREIGHT_DOCUMENT: '/DataMigration/AccountReceivable/Freight-Document',
      TRUCKING_DOCUMENT: '/DataMigration/AccountReceivable/Trucking-Document',
      FREIGHT_CREDIT_NOTE_DOCUMENT:
        '/DataMigration/AccountReceivable/Freight-CreditNote-Document',
      TRUCKING_CREDIT_NOTE_DOCUMENT:
        '/DataMigration/AccountReceivable/Trucking-CreditNote-Document',
      YARD_DOCUMENT: '/DataMigration/AccountReceivable/Yard-Document',
      SHIPPING_LINES_DOCUMENT:
        '/DataMigration/AccountReceivable/Shipping-Lines-Document',
      POST_TO_DFO: '/DataMigration/AccountReceivable/PostToDFO',
    },
    CLOSING: {
      FREIGHT_CLOSING_ENTRY: '/DataMigration/Closing/Freight-Closing-Entry',
      TRUCKING_CLOSING_ENTRY: '/DataMigration/Closing/Trucking-Closing-Entry',
      FREIGHT_CLOSING_DIFFERENCE:
        '/DataMigration/Closing/Freight-Closing-Difference',
      CUSTODY_SETTLEMENT: '/DataMigration/Closing/Custody-Settlement',
      POST_TO_DFO: '/DataMigration/Closing/PostToDFO',
    },
    VENDOR: {
      FREIGHT_DOCUMENT: '/DataMigration/Vendor/Freight-Document',
      FREIGHT_DOCUMENT_ADJUSTMENT:
        '/DataMigration/Vendor/Freight-Document-Adjustment',
      TRUCKING_DOCUMENT: '/DataMigration/Vendor/Trucking-Document',
      TRUCKING_DOCUMENT_ADJUSTMENT:
        '/DataMigration/Vendor/Trucking-Document-Adjustment',
      PAYMENT_FREIGHT: '/DataMigration/Vendor/Payment-Freight',
      PAYMENT_TRUCKING: '/DataMigration/Vendor/Payment-Trucking',
      POST_TO_DFO: '/DataMigration/Vendor/PostToDFO',
    },
    CASH: {
      CASH_IN_FREIGHT_DOCUMENT: '/DataMigration/Cash/CashIn-Freight-Document',
      CASH_OUT_FREIGHT_DOCUMENT: '/DataMigration/Cash/CashOut-Freight-Document',
      CASH_IN_TRUCKING_DOCUMENT: '/DataMigration/Cash/CashIn-Trucking-Document',
      CASH_OUT_TRUCKING_DOCUMENT:
        '/DataMigration/Cash/CashOut-Trucking-Document',
      POST_TO_DFO: '/DataMigration/Cash/PostToDFO',
      POSTING_QUEUE: '/DataMigration/Cash/posting-queue',
      POSTING_QUEUE_PAUSE: '/DataMigration/Cash/posting-queue/pause',
      POSTING_QUEUE_RESUME: '/DataMigration/Cash/posting-queue/resume',
    },
  },
  RECONCILIATION: {
    PROCESS: '/reconciliation/process',
    DOWNLOAD: '/reconciliation/download/:id',
  },
} as const;

type ApiRoutesValues = FlattenObj<typeof API_ROUTES>;

export interface BuildUrlOptions {
  url: ApiRoutesValues;
  params?: Record<string, string>;
  query?: Record<string, QueryValue>;
}

export class ApiRoutes {
  constructor() {}

  public build(
    url: ApiRoutesValues,
    options?: Omit<BuildUrlOptions, 'url'>,
  ): string {
    if (!options) return url;

    if (!options?.params && !options?.query) return url;

    return this._buildUrl({ ...options, url });
  }

  private _buildUrl({ url, params = {}, query = {} }: BuildUrlOptions): string {
    let updatedUrl = url as string;

    for (const [key, value] of Object.entries(params)) {
      updatedUrl = updatedUrl.replace(
        new RegExp(`:${key}\\b`, 'g'),
        encodeURIComponent(value),
      );
    }

    const queryString = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryString.append(key, String(v)));
      } else if (value !== undefined && value !== null) {
        queryString.set(key, String(value));
      }
    }

    return queryString.toString() ? `${updatedUrl}?${queryString}` : updatedUrl;
  }
}

type QueryValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | null
  | undefined;

export const apiRoutes = new ApiRoutes();
