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
