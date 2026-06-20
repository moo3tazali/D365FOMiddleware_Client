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

export class CashIn {
  private static _instance: CashIn;

  public readonly mutationKey = ['cash-in-upload'];
  public readonly UPLOAD_TYPES = {
    FREIGHT_DOC: TEntryProcessorTypes.CashInFreight,
    TRUCKING_DOC: TEntryProcessorTypes.CashInTrucking,
  };

  private constructor() {}

  public static getInstance(): CashIn {
    if (!CashIn._instance) {
      CashIn._instance = new CashIn();
    }

    return CashIn._instance;
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
          (progressEvent.loaded * 100) / (progressEvent?.total || 1),
        );
        if (!options.uploadProgress) return;
        options.uploadProgress(percentCompleted);
      },
    });
  };

  public postToDFO = async (batchId: string): Promise<PostToDFOResponse> => {
    return syncService.save<PostToDFOResponse, { batchId: string }>(
      API_ROUTES.DATA_MIGRATION.CASH.POST_TO_DFO,
      { batchId },
    );
  };

  private async _getUploadApiRoute(type: number | string) {
    switch (Number(type)) {
      case this.UPLOAD_TYPES.FREIGHT_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_FREIGHT_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_TRUCKING_DOCUMENT;
      default:
        throw new Error(
          `Invalid upload type, Upload type must satisfies ${Object.entries(
            this.UPLOAD_TYPES,
          )
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')}`,
        );
    }
  }
}
