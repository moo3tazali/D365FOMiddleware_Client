import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import type { PaginationRes } from '@/interfaces/api-res';
import { API_ROUTES } from '../core/api-routes';
import { Sync } from '../core/sync';
import type { TDataBatchError } from '@/interfaces/data-batch-error';

interface TDataBatchErrorQuery {
  batchId: string;
  maxCount?: number;
  skipCount?: number;
}

export class DataBatchError {
  private static _instance: DataBatchError;
  private readonly syncService = Sync.getInstance();

  public readonly queryKey = ['data-batch-error'];

  private constructor() {}

  public static getInstance(): DataBatchError {
    if (!DataBatchError._instance) {
      DataBatchError._instance = new DataBatchError();
    }

    return DataBatchError._instance;
  }

  public errorList(
    query?: TDataBatchErrorQuery
  ): Promise<PaginationRes<TDataBatchError>> {
    return this.syncService.fetch<PaginationRes<TDataBatchError>>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.ERROR_LIST,
      {
        query: query && { ...query },
      }
    );
  }

  public errorListQueryOptions = (searchQuery?: TDataBatchErrorQuery) => {
    return queryOptions({
      queryKey: [...this.queryKey, searchQuery],
      queryFn: () => this.errorList(searchQuery),
      placeholderData: keepPreviousData,
    });
  };
}
