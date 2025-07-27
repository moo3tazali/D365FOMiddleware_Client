import { z } from 'zod';

import type { PaginationRes } from '@/interfaces/api-res';
import { API_ROUTES } from './core/api-routes';
import { Sync } from './core/sync';
import type { TDataBatch } from '@/interfaces/data-batch';
import { queryOptions } from '@tanstack/react-query';
import { SearchQuery } from './core/search-query';
import { PaginationSchema } from '@/schemas/pagination-schema';

const DataBatchQuerySchema = PaginationSchema.extend({
  batchNumber: z.string().optional(),
  entryProcessorType: z.number().optional(),
});

export type DataBatchQuery = z.infer<typeof DataBatchQuerySchema>;

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
    query?: DataBatchQuery
  ): Promise<PaginationRes<TDataBatch>> => {
    return this.syncService.fetch<PaginationRes<TDataBatch>>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.LIST,
      {
        query: query && { ...query },
      }
    );
  };

  public downloadEnhancedRecordList = async (query: {
    batchId: string;
  }): Promise<void> => {
    await this.syncService.download(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.DOWNLOAD_ENHANCED_RECORD_LIST,
      {
        query,
      }
    );
  };

  public downloadBatchErrorList = async (query: {
    batchId: string;
  }): Promise<void> => {
    await this.syncService.download(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.DOWNLOAD_BATCH_ERROR_LIST,
      {
        query,
      }
    );
  };

  public deleteBatch = async (query: { batchId: string }): Promise<void> => {
    await this.syncService.del(API_ROUTES.DATA_MIGRATION.DATA_BATCH.DELETE, {
      query: { id: query.batchId },
    });
  };

  public freightDocumentQueryOptions = (searchQuery?: {}) => {
    const query = this.searchQuery.getParsedSearch(
      DataBatchQuerySchema,
      searchQuery
    );

    const queryKey: (string | DataBatchQuery)[] = [this.queryKey];

    if (query) queryKey.push(query);

    return queryOptions({
      queryKey,
      queryFn: () => this.list(query),
    });
  };

  public freightDocumentByIdQueryOptions = (batchNumber?: string) => {
    const query = this.searchQuery.getParsedSearch(DataBatchQuerySchema, {
      maxCount: 1,
      skipCount: 0,
      batchNumber,
    });

    const queryKey: (string | DataBatchQuery)[] = [this.queryKey];

    if (query) queryKey.push(query);

    return queryOptions({
      queryKey,
      queryFn: () => this.list(query),
    });
  };
}
