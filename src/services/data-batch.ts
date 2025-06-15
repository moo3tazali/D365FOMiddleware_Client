import type { PaginationRes } from '@/interfaces/api-res';
import { API_ROUTES } from './core/api-routes';
import { Sync } from './core/sync';
import type { TDataBatch } from '@/interfaces/data-batch';
import { queryOptions } from '@tanstack/react-query';

type IDataBatchQuery = {
  batchNumber?: number;
  entryProcessorType?: number;
  maxCount?: number;
  skipCount?: number;
};

export class DataBatch {
  private static _instance: DataBatch;
  private readonly syncService = Sync.getInstance();

  public readonly queryKey = 'data-batch';

  private constructor() {}

  public static getInstance(): DataBatch {
    if (!DataBatch._instance) {
      DataBatch._instance = new DataBatch();
    }

    return DataBatch._instance;
  }

  public list = async (
    query?: IDataBatchQuery
  ): Promise<PaginationRes<TDataBatch>> => {
    return this.syncService.fetch<
      PaginationRes<TDataBatch>
    >(API_ROUTES.DATA_MIGRATION.DATA_BATCH.LIST, {
      query,
    });
  };

  public freightDocumentQueryOptions = (
    query?: IDataBatchQuery
  ) => {
    const queryKey: (string | IDataBatchQuery)[] = [
      this.queryKey,
    ];

    if (query) queryKey.push(query);

    return queryOptions({
      queryKey,
      queryFn: () => this.list(query),
    });
  };
}
