import { Sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';
import { TEntryProcessorTypes, type TDataBatch } from '@/interfaces/data-batch';

interface UploadData {
  companyId: string;
  billingCodeId?: string;
  dataFile: File;
}

interface UploadResponse extends TDataBatch {}

const syncService = Sync.getInstance({
  public: true,
  backend: 'NEST',
});

export class Vendor {
  private static _instance: Vendor;

  public readonly mutationKey = ['vendor-upload'];
  public readonly UPLOAD_TYPES = {
    FREIGHT_DOC: TEntryProcessorTypes.VendorFreight,
    TRUCKING_DOC: TEntryProcessorTypes.VendorTrucking,
    FREIGHT_DOCUMENT_ADJUSTMENT: TEntryProcessorTypes.VendorFreightAdjustment,
    TRUCKING_DOCUMENT_ADJUSTMENT: TEntryProcessorTypes.VendorTruckingAdjustment,
  };

  private constructor() {}

  public static getInstance(): Vendor {
    if (!Vendor._instance) {
      Vendor._instance = new Vendor();
    }

    return Vendor._instance;
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

  public isAdjustment(type: number | string) {
    return [
      this.UPLOAD_TYPES.FREIGHT_DOCUMENT_ADJUSTMENT,
      this.UPLOAD_TYPES.TRUCKING_DOCUMENT_ADJUSTMENT,
    ].includes(Number(type));
  }

  private async _getUploadApiRoute(type: number | string) {
    switch (Number(type)) {
      case this.UPLOAD_TYPES.FREIGHT_DOC:
        return API_ROUTES.DATA_MIGRATION.VENDOR.FREIGHT_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_DOC:
        return API_ROUTES.DATA_MIGRATION.VENDOR.TRUCKING_DOCUMENT;
      case this.UPLOAD_TYPES.FREIGHT_DOCUMENT_ADJUSTMENT:
        return API_ROUTES.DATA_MIGRATION.VENDOR.FREIGHT_DOCUMENT_ADJUSTMENT;
      case this.UPLOAD_TYPES.TRUCKING_DOCUMENT_ADJUSTMENT:
        return API_ROUTES.DATA_MIGRATION.VENDOR.TRUCKING_DOCUMENT_ADJUSTMENT;
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
