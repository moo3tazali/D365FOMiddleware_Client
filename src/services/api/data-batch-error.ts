import { z } from 'zod';
import { queryOptions } from '@tanstack/react-query';

import type { PaginationRes } from '@/interfaces/api-res';
import { API_ROUTES } from '../core/api-routes';
import { Sync } from '../core/sync';
import type { TDataBatchError } from '@/interfaces/data-batch-error';
import { SearchQuery } from '../core/search-query';
import { PaginationSchema } from '@/schemas/pagination-schema';

const DataBatchErrorQuerySchema = PaginationSchema.extend({
  batchId: z.string().min(1, 'Batch ID is required').ulid(),
});

type TDataBatchErrorQuery = z.infer<typeof DataBatchErrorQuerySchema>;

export class DataBatchError {
  private static _instance: DataBatchError;
  private readonly syncService = Sync.getInstance();
  private readonly searchQuery = SearchQuery.getInstance();

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

  public errorListQueryOptions = (searchQuery?: {}) => {
    const query = this.searchQuery.getParsedSearch<TDataBatchErrorQuery>(
      DataBatchErrorQuerySchema,
      searchQuery
    );

    const queryKey: (string | TDataBatchErrorQuery)[] = this.queryKey;

    if (query) queryKey.push(query);

    return queryOptions({
      queryKey,
      queryFn: () => this.errorList(query),
    });
  };
}
