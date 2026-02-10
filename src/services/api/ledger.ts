import { Sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';
import { TEntryProcessorTypes, type TDataBatch } from '@/interfaces/data-batch';

interface UploadData {
  companyId: string;
  dataFile: File;
}

interface UploadResponse extends TDataBatch {}

interface PostToDFOResponse {
  jobId: string;
  message: string;
}

const syncService = Sync.getInstance();

export class Ledger {
  private static _instance: Ledger;

  public readonly mutationKey = ['ledger-upload'];
  public readonly UPLOAD_TYPES = {
    FREIGHT_CLOSING_DOC: TEntryProcessorTypes.LedgerFreightClosingEntry,
    TRUCKING_CLOSING_DOC: TEntryProcessorTypes.LedgerTruckingClosingEntry,
    FREIGHT_VENDOR_ACCRUAL_DOC: TEntryProcessorTypes.VendorFreight,
    TRUCKING_VENDOR_ACCRUAL_DOC: TEntryProcessorTypes.VendorTrucking,
    CASH_OUT_DOC: TEntryProcessorTypes.LedgerCashOut,
    CUSTODY_SETTLEMENT: TEntryProcessorTypes.LedgerCustodySettlement,
  };

  private constructor() {}

  public static getInstance(): Ledger {
    if (!Ledger._instance) {
      Ledger._instance = new Ledger();
    }

    return Ledger._instance;
  }

  public upload = async (options: {
    type: number | string;
    data: UploadData;
    uploadProgress?: (prog: number) => void;
  }): Promise<UploadResponse> => {
    const { data, type } = options;

    const apiRoute = await this._getUploadApiRoute(type);

    return syncService.save<UploadResponse, UploadData>(apiRoute, data, {
      formData: true,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent?.total || 1)
        );
        if (!options.uploadProgress) return;
        options.uploadProgress(percentCompleted);
      },
    });
  };

  public postToDFO = async (batchId: string): Promise<PostToDFOResponse> => {
    return syncService.save<PostToDFOResponse, { batchId: string }>(
      API_ROUTES.DATA_MIGRATION.LEDGER.POST_TO_DFO,
      { batchId }
    );
  };

  private async _getUploadApiRoute(type: number | string) {
    switch (Number(type)) {
      case this.UPLOAD_TYPES.FREIGHT_CLOSING_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER.FREIGHT_CLOSING_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_CLOSING_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER.TRUCKING_CLOSING_DOCUMENT;
      case this.UPLOAD_TYPES.FREIGHT_VENDOR_ACCRUAL_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER.FREIGHT_VENDOR_ACCRUAL_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_VENDOR_ACCRUAL_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER
          .TRUCKING_VENDOR_ACCRUAL_DOCUMENT;
      case this.UPLOAD_TYPES.CASH_OUT_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER.CASH_OUT_DOCUMENT;
      case this.UPLOAD_TYPES.CUSTODY_SETTLEMENT:
        return API_ROUTES.DATA_MIGRATION.LEDGER.CUSTODY_SETTLEMENT;

      default:
        throw new Error(
          `Invalid upload type, Upload type must satisfies ${Object.entries(
            this.UPLOAD_TYPES
          )
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')}`
        );
    }
  }
}
