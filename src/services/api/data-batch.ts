import type { PaginationRes } from '@/interfaces/api-res';
import { API_ROUTES } from '../core/api-routes';
import { Sync } from '../core/sync';
import { TEntryProcessorTypes, type TDataBatch } from '@/interfaces/data-batch';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { TPagination } from '@/interfaces/pagination';

interface DataBatchQuery extends TPagination {
  batchNumberIds?: string[];
  entryProcessorTypes?: number[];
}

interface InsertBatchPayload {
  batchId: string;
  skipErrors: boolean;
}

type TModule =
  | 'accountReceivable'
  | 'accountPayable'
  | 'ledger'
  | 'cashManagement'
  | 'vendor';

export class DataBatch {
  private static _instance: DataBatch;
  private readonly syncService = Sync.getInstance();

  public readonly queryKey = ['data-batch'];

  private constructor() {}

  public static getInstance(): DataBatch {
    if (!DataBatch._instance) {
      DataBatch._instance = new DataBatch();
    }

    return DataBatch._instance;
  }

  public list = async (
    query?: DataBatchQuery
  ): Promise<PaginationRes<TDataBatch>> => {
    return this.syncService.fetch<PaginationRes<TDataBatch>>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.LIST,
      {
        query: query && { ...query },
      }
    );
  };

  public one = async (batchId: string): Promise<PaginationRes<TDataBatch>> => {
    return this.syncService
      .fetch<TDataBatch>(API_ROUTES.DATA_MIGRATION.DATA_BATCH.ONE, {
        params: { batchId },
      })
      .then((res) => ({
        pageNumber: 1,
        totalCount: 1,
        pageSize: 1,
        totalPages: 1,
        items: [res],
      }));
  };

  public downloadEnhancedRecordList = async (query: {
    batchId: string;
  }): Promise<void> => {
    await this.syncService.download(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.DOWNLOAD_ENHANCED_RECORD_LIST,
      {
        body: query,
      }
    );
  };

  public downloadBatchErrorList = async (query: {
    batchId: string;
  }): Promise<void> => {
    await this.syncService.download(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.DOWNLOAD_BATCH_ERROR_LIST,
      {
        body: query,
      }
    );
  };

  public deleteBatch = async (query: { batchId: string }): Promise<void> => {
    await this.syncService.del(API_ROUTES.DATA_MIGRATION.DATA_BATCH.DELETE, {
      query: { batchId: query.batchId },
    });
  };

  public insertBatch = async (payload: InsertBatchPayload): Promise<void> => {
    await this.syncService.save<void, InsertBatchPayload>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.INSERT,
      payload
    );
  };

  public batchQueryOptions = (
    module: TModule,
    searchQuery?: DataBatchQuery
  ) => {
    const queryKey = this.getQueryKey(module, searchQuery);

    return queryOptions({
      queryKey,
      queryFn: () => this.list(queryKey[1]),
      placeholderData: keepPreviousData,
    });
  };

  public batchByIdQueryOptions = (batchId?: string) => {
    return queryOptions({
      queryKey: [...this.queryKey, { batchId }],
      queryFn: () =>
        batchId
          ? this.one(batchId)
          : {
              pageNumber: 1,
              totalCount: 1,
              pageSize: 1,
              totalPages: 1,
              items: [],
            },
    });
  };

  public getDefaultEntryProcessorType(module: TModule) {
    switch (module) {
      case 'accountReceivable':
        return [
          TEntryProcessorTypes.AccountReceivableFreight,
          TEntryProcessorTypes.AccountReceivableTrucking,
          TEntryProcessorTypes.AccountReceivableFreightCreditNote,
          TEntryProcessorTypes.AccountReceivableTruckingCreditNote,
        ];
      case 'ledger':
        return [
          TEntryProcessorTypes.LedgerFreightClosingEntry,
          TEntryProcessorTypes.LedgerTruckingClosingEntry,
        ];
      case 'accountPayable':
        return [
          TEntryProcessorTypes.AccountPayableFreight,
          TEntryProcessorTypes.AccountPayableTrucking,
        ];
      case 'cashManagement':
        return [
          TEntryProcessorTypes.LedgerCashOut,
          TEntryProcessorTypes.LedgerBankOut,
          TEntryProcessorTypes.LedgerVisaOut,
        ];
      case 'vendor':
        return [
          TEntryProcessorTypes.VendorFreight,
          TEntryProcessorTypes.VendorTrucking,
          TEntryProcessorTypes.VendorFreightAdjustment,
          TEntryProcessorTypes.VendorTruckingAdjustment,
        ];
      default:
        return [];
    }
  }

  public getQueryKey(
    module: TModule,
    searchQuery?: DataBatchQuery
  ): [string, DataBatchQuery] {
    const entryProcessorTypes =
      searchQuery?.entryProcessorTypes ||
      this.getDefaultEntryProcessorType(module);

    const query: DataBatchQuery = {
      ...(searchQuery || {}),
      entryProcessorTypes,
    };

    return [this.queryKey[0], query];
  }
}
