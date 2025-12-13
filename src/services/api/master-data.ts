import type {
  IMasterDataSyncStatus,
  IMasterDataSyncJobResponse,
} from '@/interfaces/master-data';
import { API_ROUTES } from '../core/api-routes';
import { Sync } from '../core/sync';
import { queryOptions } from '@tanstack/react-query';

export const SYNC_TYPES = {
  CUSTOMERS: 'customers',
  FINANCIAL_DIMENSIONS: 'financial-dimensions',
  BILLING_DATA: 'billing-data',
  MAIN_ACCOUNTS: 'main-accounts',
  VENDORS: 'vendors',
  EXCHANGE_RATES: 'exchange-rates',
} as const;

export const SYNC_TYPES_LIST = Object.values(SYNC_TYPES);

export type SyncType = (typeof SYNC_TYPES_LIST)[number];

export interface MasterDataPayload {
  company: string;
  chartOfAccounts: string;
  rateType: string;
}

export class MasterData {
  private static _instance: MasterData;
  private readonly syncService = Sync.getInstance({
    public: true,
    backend: 'NEST',
  });

  public readonly queryKey = ['finance.master-data'];

  public readonly syncTypes = SYNC_TYPES;

  private constructor() {}

  public static getInstance(): MasterData {
    if (!MasterData._instance) {
      MasterData._instance = new MasterData();
    }

    return MasterData._instance;
  }

  public getSyncList = async (): Promise<IMasterDataSyncStatus[]> => {
    return this.syncService.fetch<IMasterDataSyncStatus[]>(
      API_ROUTES.FINANCE.MASTER_DATA.SYNC_STATUS
    );
  };

  public getSyncListQueryOptions = () => {
    return queryOptions({
      queryKey: this.queryKey,
      queryFn: this.getSyncList,
    });
  };

  public sync = async (data: {
    type: SyncType;
    payload: MasterDataPayload;
  }): Promise<IMasterDataSyncJobResponse> => {
    const { type, payload } = data;
    switch (type) {
      case SYNC_TYPES.CUSTOMERS:
        return this.syncCustomers(payload);
      case SYNC_TYPES.FINANCIAL_DIMENSIONS:
        return this.syncFinancilDimensions(payload);
      case SYNC_TYPES.BILLING_DATA:
        return this.syncBillingData(payload);
      case SYNC_TYPES.MAIN_ACCOUNTS:
        return this.syncMainAccountsData(payload);
      case SYNC_TYPES.VENDORS:
        return this.syncVendors(payload);
      case SYNC_TYPES.EXCHANGE_RATES:
        return this.syncExchangeRates(payload);
      default:
        throw new Error(`No Sync function for this master data '${type}'`);
    }
  };

  public syncCustomers = async (
    payload: MasterDataPayload
  ): Promise<IMasterDataSyncJobResponse> => {
    return this.syncService.save<IMasterDataSyncJobResponse>(
      API_ROUTES.FINANCE.MASTER_DATA.CUSTOMERS.SYNC,
      undefined,
      {
        query: { company: payload.company },
      }
    );
  };

  public syncFinancilDimensions = async (
    payload: MasterDataPayload
  ): Promise<IMasterDataSyncJobResponse> => {
    return this.syncService.save<IMasterDataSyncJobResponse>(
      API_ROUTES.FINANCE.MASTER_DATA.FINANCIAL_DIMENSIONS.SYNC,
      undefined,
      {
        query: { company: payload.company },
      }
    );
  };

  public syncBillingData = async (
    payload: MasterDataPayload
  ): Promise<IMasterDataSyncJobResponse> => {
    return this.syncService.save<IMasterDataSyncJobResponse>(
      API_ROUTES.FINANCE.MASTER_DATA.BILLING_DATA.SYNC,
      undefined,
      {
        query: { company: payload.company },
      }
    );
  };

  public syncMainAccountsData = async (
    payload: MasterDataPayload
  ): Promise<IMasterDataSyncJobResponse> => {
    return this.syncService.save<IMasterDataSyncJobResponse>(
      API_ROUTES.FINANCE.MASTER_DATA.MAIN_ACCOUNTS.SYNC,
      undefined,
      {
        query: { chartOfAccounts: payload.chartOfAccounts },
      }
    );
  };

  public syncVendors = async (
    payload: MasterDataPayload
  ): Promise<IMasterDataSyncJobResponse> => {
    return this.syncService.save<IMasterDataSyncJobResponse>(
      API_ROUTES.FINANCE.MASTER_DATA.VENDORS.SYNC,
      undefined,
      {
        query: { company: payload.company },
      }
    );
  };

  public syncExchangeRates = async (
    payload: MasterDataPayload
  ): Promise<IMasterDataSyncJobResponse> => {
    return this.syncService.save<IMasterDataSyncJobResponse>(
      API_ROUTES.FINANCE.MASTER_DATA.EXCHANGE_RATES.SYNC,
      undefined,
      {
        query: { company: payload.company, rateType: payload.rateType },
      }
    );
  };
}
