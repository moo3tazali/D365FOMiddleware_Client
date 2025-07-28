import { Sync } from './core/sync';
import { API_ROUTES } from './core/api-routes';
import type { TDataBatch } from '@/interfaces/data-batch';

interface UploadData {
  companyId: string;
  dataFile: File;
}

interface UploadResponse extends TDataBatch {}

const syncService = Sync.getInstance();

export class Ledger {
  private static _instance: Ledger;

  public readonly mutationKey = 'ledger-upload';
  public readonly UPLOAD_TYPES = {
    FREIGHT_CLOSING_DOC: 1,
    FREIGHT_CLOSING: 2,
    TRUCKING_CLOSING_DOC: 3,
    TRUCKING_CLOSING: 4,
    FREIGHT_VENDOR_ACCRUAL_DOC: 5,
    FREIGHT_VENDOR_ACCRUAL: 6,
    TRUCKING_VENDOR_ACCRUAL_DOC: 7,
    TRUCKING_VENDOR_ACCRUAL: 8,
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

    const payload = {
      company: data.companyId,
      dataFile: data.dataFile,
    };

    return syncService.save<UploadResponse, typeof payload>(apiRoute, payload, {
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
      case this.UPLOAD_TYPES.FREIGHT_CLOSING:
        return API_ROUTES.DATA_MIGRATION.LEDGER.FREIGHT_CLOSING;
      case this.UPLOAD_TYPES.TRUCKING_CLOSING:
        return API_ROUTES.DATA_MIGRATION.LEDGER.TRUCKING_CLOSING;
      case this.UPLOAD_TYPES.FREIGHT_CLOSING_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER.FREIGHT_CLOSING_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_CLOSING_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER.TRUCKING_CLOSING_DOCUMENT;
      case this.UPLOAD_TYPES.FREIGHT_VENDOR_ACCRUAL:
        return API_ROUTES.DATA_MIGRATION.LEDGER.FREIGHT_VENDOR_ACCRUAL;
      case this.UPLOAD_TYPES.TRUCKING_VENDOR_ACCRUAL:
        return API_ROUTES.DATA_MIGRATION.LEDGER.TRUCKING_VENDOR_ACCRUAL;
      case this.UPLOAD_TYPES.FREIGHT_VENDOR_ACCRUAL_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER.FREIGHT_VENDOR_ACCRUAL_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_VENDOR_ACCRUAL_DOC:
        return API_ROUTES.DATA_MIGRATION.LEDGER
          .TRUCKING_VENDOR_ACCRUAL_DOCUMENT;
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
