import type { PaginationRes } from '@/interfaces/api-res';
import { API_ROUTES } from './core/api-routes';
import { Sync } from './core/sync';
import type {
  IDataBatchQuery,
  TDataBatch,
  TDataBatchFilter,
} from '@/interfaces/data-batch';
import { queryOptions } from '@tanstack/react-query';
import { SearchQuery } from './core/search-query';

export class DataBatch {
  private static _instance: DataBatch;
  private readonly syncService = Sync.getInstance();
  private readonly searchQuery = SearchQuery.getInstance();

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
    return this.syncService.fetch<PaginationRes<TDataBatch>>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.LIST,
      {
        query: query && { ...query },
      }
    );
  };

  public freightDocumentQueryOptions = (searchQuery?: {}) => {
    const query =
      this.searchQuery.getParsedSearch<TDataBatchFilter>(searchQuery);

    const queryKey: (string | IDataBatchQuery)[] = [this.queryKey];

    if (query) queryKey.push(query);

    return queryOptions({
      queryKey,
      queryFn: () => this.list(query),
    });
  };
}
