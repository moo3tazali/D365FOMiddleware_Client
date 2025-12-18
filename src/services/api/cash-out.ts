import { Sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';
import { TEntryProcessorTypes, type TDataBatch } from '@/interfaces/data-batch';

interface UploadData {
  companyId: string;
  dataFile: File;
}

interface UploadResponse extends TDataBatch {}

const syncService = Sync.getInstance();

export class CashOut {
  private static _instance: CashOut;

  public readonly mutationKey = ['cash-out-upload'];
  public readonly UPLOAD_TYPES = {
    FREIGHT_DOC: TEntryProcessorTypes.CashOutFreight,
  };

  private constructor() {}

  public static getInstance(): CashOut {
    if (!CashOut._instance) {
      CashOut._instance = new CashOut();
    }

    return CashOut._instance;
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

  private async _getUploadApiRoute(type: number | string) {
    switch (Number(type)) {
      case this.UPLOAD_TYPES.FREIGHT_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH_OUT.FREIGHT_DOCUMENT;
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
