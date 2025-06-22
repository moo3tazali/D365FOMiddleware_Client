import { z } from 'zod';
import type { TPaginationSearchQuery } from './search-query';
import type { DataBatchErrorFilterSchema } from '@/schemas/data-batch-error';

export interface TDataBatchError {
  id: string;
  batchId: string;
  sourceRecordIds: string[];
  errorMessages: string[];
  accountDimensionsModel: {
    mainAccount: string;
    costCenter: string;
    activityName: string;
    businessUnit: string;
    location: string;
    customer: string;
    subCustomer: string;
    vendor: string;
    subVendor: string;
    chargeType: string;
    salesMan: string;
    coordinatorMan: string;
    freightType: string;
    truckerType: string;
    truckNumber: string;
    direction: string;
    worker: string;
    fixedAsset: string;
    lease: string;
  };
  enhancedRecordIds: string[];
}

export type TDataBatchErrorFilter = z.infer<typeof DataBatchErrorFilterSchema>;

export interface IDataBatchErrorQuery
  extends TPaginationSearchQuery,
    TDataBatchErrorFilter {}
