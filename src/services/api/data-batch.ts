import type { PaginationRes } from '@/interfaces/api-res';
import { API_ROUTES } from '../core/api-routes';
import { sync } from '../core/sync';
import {
  TEntryProcessorTypes,
  type TBatchPostingPauseState,
  type TDataBatch,
  type TDataBatchMissingMasterData,
  type TMissingMasterDataPage,
  type TRemediationSummary,
} from '@/interfaces/data-batch';
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from '@tanstack/react-query';
import type { TPagination } from '@/interfaces/pagination';

interface DataBatchQuery extends TPagination {
  batchNumberIds?: string[];
  entryProcessorTypes?: number[];
}

interface InsertBatchPayload {
  batchId: string;
  skipErrors: boolean;
}

export interface BatchReprocessSubmission {
  jobId: string;
  status: 'queued' | 'already-running';
  message: string;
}

export interface MissingMasterDataFilters {
  type?: string;
  search?: string;
  creationStatus?: TDataBatchMissingMasterData['creationStatus'];
  limit?: number;
}

type TModule =
  | 'accountReceivable'
  | 'accountPayable'
  | 'ledger'
  | 'cashManagement'
  | 'cashIn'
  | 'cashOut'
  | 'vendor';

export class DataBatch {
  private readonly syncService = sync;

  public readonly queryKey = ['data-batch'];

  constructor() {}

  public list = async (
    query?: DataBatchQuery,
  ): Promise<PaginationRes<TDataBatch>> => {
    return this.syncService.fetch<PaginationRes<TDataBatch>>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.LIST,
      {
        query: query && { ...query },
      },
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
      },
    );
  };

  public downloadBatchErrorList = async (query: {
    batchId: string;
  }): Promise<void> => {
    await this.syncService.download(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.DOWNLOAD_BATCH_ERROR_LIST,
      {
        body: query,
      },
    );
  };

  public downloadSourceFile = async (query: {
    batchId: string;
  }): Promise<void> => {
    await this.syncService.download(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.DOWNLOAD_SOURCE_FILE,
      {
        body: query,
        defaultFileName: `source-records-${query.batchId}.xlsx`,
      },
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
      payload,
    );
  };

  public batchQueryOptions = (
    module: TModule,
    searchQuery?: DataBatchQuery,
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
          TEntryProcessorTypes.AccountReceivableYard,
          TEntryProcessorTypes.AccountReceivableShippingLines,
        ];
      case 'ledger':
        return [
          TEntryProcessorTypes.LedgerFreightClosingEntry,
          TEntryProcessorTypes.LedgerTruckingClosingEntry,
          TEntryProcessorTypes.LedgerCustodySettlement,
          TEntryProcessorTypes.LedgerFreightClosingDifference,
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
      case 'cashIn':
        return [
          TEntryProcessorTypes.CashInFreight,
          TEntryProcessorTypes.CashInTrucking,
        ];
      case 'cashOut':
        return [
          TEntryProcessorTypes.CashOutFreight,
          TEntryProcessorTypes.CashOutTrucking,
        ];
      case 'vendor':
        return [
          TEntryProcessorTypes.VendorFreight,
          TEntryProcessorTypes.VendorTrucking,
          TEntryProcessorTypes.VendorFreightAdjustment,
          TEntryProcessorTypes.VendorTruckingAdjustment,
          TEntryProcessorTypes.VendorPaymentFreight,
          TEntryProcessorTypes.VendorPaymentTrucking,
        ];
      default:
        return [];
    }
  }

  public getQueryKey(
    module: TModule,
    searchQuery?: DataBatchQuery,
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

  public getMissingMasterData = async (
    batchId: string,
    filters?: MissingMasterDataFilters & { page?: number },
  ): Promise<TMissingMasterDataPage> => {
    return this.syncService.fetch<TMissingMasterDataPage>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.MISSING_MASTER_DATA,
      {
        params: { batchId },
        query: filters && { ...filters },
      },
    );
  };

  public getRemediationSummary = async (
    batchId: string,
  ): Promise<TRemediationSummary> => {
    return this.syncService.fetch<TRemediationSummary>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.REMEDIATION_SUMMARY,
      {
        params: { batchId },
      },
    );
  };

  public reprocess = async (
    batchId: string,
  ): Promise<BatchReprocessSubmission> => {
    return this.syncService.save<BatchReprocessSubmission, void>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.REPROCESS,
      undefined,
      {
        params: { batchId },
      },
    );
  };

  /**
   * Hold the batch back from being posted to D365FO. A worker that is already
   * posting it stops after the journal it is currently writing.
   */
  public pausePosting = async (
    batchId: string,
  ): Promise<TBatchPostingPauseState> => {
    return this.syncService.save<TBatchPostingPauseState, void>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.POSTING_PAUSE,
      undefined,
      { params: { batchId } },
    );
  };

  /** Let a paused batch continue with the journals that are still pending. */
  public resumePosting = async (
    batchId: string,
  ): Promise<TBatchPostingPauseState> => {
    return this.syncService.save<TBatchPostingPauseState, void>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.POSTING_RESUME,
      undefined,
      { params: { batchId } },
    );
  };

  public missingMasterDataInfiniteQueryOptions = (
    batchId: string,
    filters?: MissingMasterDataFilters,
  ) => {
    return infiniteQueryOptions({
      queryKey: [...this.queryKey, 'missing-master-data', batchId, filters],
      queryFn: ({ pageParam }) =>
        this.getMissingMasterData(batchId, {
          ...filters,
          page: pageParam as number,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.pagination.hasNextPage
          ? lastPage.pagination.page + 1
          : undefined,
    });
  };

  public remediationSummaryQueryOptions = (batchId: string) => {
    return queryOptions({
      queryKey: [...this.queryKey, 'remediation-summary', batchId],
      queryFn: () => this.getRemediationSummary(batchId),
    });
  };

  /** @deprecated Use missingMasterDataInfiniteQueryOptions instead */
  public missingMasterDataQueryOptions = (batchId: string) => {
    return queryOptions({
      queryKey: [...this.queryKey, 'missing-master-data', batchId],
      queryFn: () => this.getMissingMasterData(batchId).then((res) => res.data),
    });
  };
}
