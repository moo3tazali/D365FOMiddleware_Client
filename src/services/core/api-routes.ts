import type { FlattenObj } from '@/lib/utils';

export const API_ROUTES = {
  ADMIN: {
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
    },
  },
  PUBLIC: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      LOGOUT_ALL: '/auth/logout-all',
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
      ERROR_LIST: '/DataMigration/DataBatch/error-list',
      DELETE: '/DataMigration/DataBatch',
      INSERT: '/DataMigration/DataBatch/insert',
    },
    ACCOUNT_RECEIVABLE: {
      FREIGHT_DOCUMENT: '/DataMigration/AccountReceivable/Freight-Document',
      FREIGHT: '/DataMigration/AccountReceivable/Freight',
      TRUCKING_DOCUMENT: '/DataMigration/AccountReceivable/Trucking-Document',
      TRUCKING: '/DataMigration/AccountReceivable/Trucking',
      FREIGHT_CREDIT_NOTE_DOCUMENT:
        '/DataMigration/AccountReceivable/Freight-CreditNote-Document',
      FREIGHT_CREDIT_NOTE:
        '/DataMigration/AccountReceivable/Freight-CreditNote',
      TRUCKING_CREDIT_NOTE_DOCUMENT:
        '/DataMigration/AccountReceivable/Trucking-CreditNote-Document',
      TRUCKING_CREDIT_NOTE:
        '/DataMigration/AccountReceivable/Trucking-CreditNote',
    },
    LEDGER: {
      FREIGHT_CLOSING_DOCUMENT: '/DataMigration/Ledger/Freight-Closing-Entry',
      FREIGHT_CLOSING: '/DataMigration/Ledger/Freight-Closing',
      TRUCKING_CLOSING_DOCUMENT: '/DataMigration/Ledger/Trucking-Closing-Entry',
      TRUCKING_CLOSING: '/DataMigration/Ledger/Trucking-Closing',
      FREIGHT_VENDOR_ACCRUAL_DOCUMENT:
        '/DataMigration/Ledger/Freight-Vendor-Accrual-Document',
      FREIGHT_VENDOR_ACCRUAL: '/DataMigration/Ledger/Freight-Vendor-Accrual',
      TRUCKING_VENDOR_ACCRUAL_DOCUMENT:
        '/DataMigration/Ledger/Trucking-Vendor-Accrual-Document',
      TRUCKING_VENDOR_ACCRUAL: '/DataMigration/Ledger/Trucking-Vendor-Accrual',
      CASH_OUT_DOCUMENT: '/DataMigration/Ledger/Cash-Out-Document',
      CASH_IN_DOCUMENT: '/DataMigration/Ledger/Cash-In-Document',
    },
    VENDOR: {
      FREIGHT_DOCUMENT: '/DataMigration/Vendor/Freight-Document',
      FREIGHT_DOCUMENT_ADJUSTMENT:
        '/DataMigration/Vendor/Freight-Document-Adjustment',
      TRUCKING_DOCUMENT: '/DataMigration/Vendor/Trucking-Document',
      TRUCKING_DOCUMENT_ADJUSTMENT:
        '/DataMigration/Vendor/Trucking-Document-Adjustment',
    },
    CASH_IN: {
      FREIGHT_DOCUMENT: '/DataMigration/CashIn/Freight-Document',
    },
    CASH_OUT: {
      FREIGHT_DOCUMENT: '/DataMigration/CashOut/Freight-Document',
    },
  },
} as const;

type ApiRoutesValues = FlattenObj<typeof API_ROUTES>;

export interface BuildUrlOptions {
  url: ApiRoutesValues;
  params?: Record<string, string>;
  query?: Record<string, QueryValue>;
}

export class ApiRoutes {
  private static _instance: ApiRoutes;

  private constructor() {}

  // singleton pattern
  public static getInstance(): ApiRoutes {
    if (!ApiRoutes._instance) {
      ApiRoutes._instance = new ApiRoutes();
    }
    return ApiRoutes._instance;
  }

  public build(
    url: ApiRoutesValues,
    options?: Omit<BuildUrlOptions, 'url'>
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
        encodeURIComponent(value)
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
