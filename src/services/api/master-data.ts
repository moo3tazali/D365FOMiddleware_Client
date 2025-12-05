import { API_ROUTES } from '../core/api-routes';
import { Sync } from '../core/sync';

const displayNames = [
  'Customers',
  'Financial Dimensions',
  'Billing Data',
  'Main Accounts',
  'Vendor',
  'Exchange Rates',
] as const;

export type MasterDataDisplayName = (typeof displayNames)[number];

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

  public readonly displayNames = displayNames;

  private constructor() {}

  public static getInstance(): MasterData {
    if (!MasterData._instance) {
      MasterData._instance = new MasterData();
    }

    return MasterData._instance;
  }

  public sync = async (
    name: MasterDataDisplayName,
    payload: MasterDataPayload
  ): Promise<void> => {
    switch (name) {
      case 'Customers':
        return this.syncCustomers(payload);
      case 'Financial Dimensions':
        return this.syncFinancilDimensions(payload);
      case 'Billing Data':
        return this.syncBillingData(payload);
      case 'Main Accounts':
        return this.syncMainAccountsData(payload);
      case 'Vendor':
        return this.syncVendors(payload);
      case 'Exchange Rates':
        return this.syncExchangeRates(payload);
      default:
        throw new Error(`No Sync function for this master data '${name}'`);
    }
  };

  public syncCustomers = async (payload: MasterDataPayload): Promise<void> => {
    await this.syncService.save(
      API_ROUTES.FINANCE.MASTER_DATA.CUSTOMERS.SYNC,
      undefined,
      {
        query: { company: payload.company },
      }
    );
  };

  public syncFinancilDimensions = async (
    payload: MasterDataPayload
  ): Promise<void> => {
    await this.syncService.save(
      API_ROUTES.FINANCE.MASTER_DATA.FINANCIAL_DIMENSIONS.SYNC,
      undefined,
      {
        query: { company: payload.company },
      }
    );
  };

  public syncBillingData = async (
    payload: MasterDataPayload
  ): Promise<void> => {
    await this.syncService.save(
      API_ROUTES.FINANCE.MASTER_DATA.BILLING_DATA.SYNC,
      undefined,
      {
        query: { company: payload.company },
      }
    );
  };

  public syncMainAccountsData = async (
    payload: MasterDataPayload
  ): Promise<void> => {
    await this.syncService.save(
      API_ROUTES.FINANCE.MASTER_DATA.MAIN_ACCOUNTS.SYNC,
      undefined,
      {
        query: { chartOfAccounts: payload.chartOfAccounts },
      }
    );
  };

  public syncVendors = async (payload: MasterDataPayload): Promise<void> => {
    await this.syncService.save(
      API_ROUTES.FINANCE.MASTER_DATA.VENDORS.SYNC,
      undefined,
      {
        query: { company: payload.company },
      }
    );
  };

  public syncExchangeRates = async (
    payload: MasterDataPayload
  ): Promise<void> => {
    await this.syncService.save(
      API_ROUTES.FINANCE.MASTER_DATA.EXCHANGE_RATES.SYNC,
      undefined,
      {
        query: { company: payload.company, rateType: payload.rateType },
      }
    );
  };
}
