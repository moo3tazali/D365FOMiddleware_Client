import type { FlattenObj } from '@/lib/utils';

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  DATA_MIGRATION: {
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
    DATA_BATCH: {
      LIST: '/DataMigration/DataBatch/list',
      DOWNLOAD_ENHANCED_RECORD_LIST:
        '/DataMigration/DataBatch/download-enhanced-record-list',
      DOWNLOAD_BATCH_ERROR_LIST:
        '/DataMigration/DataBatch/download-batch-error-list',
      ERROR_LIST: '/DataMigration/DataBatch/error-list',
      DELETE: '/DataMigration/DataBatch',
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
