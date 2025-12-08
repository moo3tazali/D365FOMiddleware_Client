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

export class AccountReceivable {
  private static _instance: AccountReceivable;

  public readonly mutationKey = ['account-receivable-upload'];
  public readonly UPLOAD_TYPES = {
    FREIGHT_DOC: TEntryProcessorTypes.AccountReceivableFreight,
    TRUCKING_DOC: TEntryProcessorTypes.AccountReceivableTrucking,
    FREIGHT_CREDIT_NOTE_DOC:
      TEntryProcessorTypes.AccountReceivableFreightCreditNote,
    TRUCKING_CREDIT_NOTE_DOC:
      TEntryProcessorTypes.AccountReceivableTruckingCreditNote,
  };

  private constructor() {}

  public static getInstance(): AccountReceivable {
    if (!AccountReceivable._instance) {
      AccountReceivable._instance = new AccountReceivable();
    }

    return AccountReceivable._instance;
  }

  public upload = async (options: {
    type: number | string;
    data: UploadData;
    uploadProgress?: (prog: number) => void;
  }): Promise<UploadResponse> => {
    const { data, type } = options;

    if (
      [this.UPLOAD_TYPES.FREIGHT_DOC, this.UPLOAD_TYPES.TRUCKING_DOC].includes(
        Number(type)
      ) &&
      !data.billingCodeId
    ) {
      throw new Error('billingCodeId is required for this upload type.');
    }

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

  public isCreditNote(type: number | string) {
    return [
      this.UPLOAD_TYPES.FREIGHT_CREDIT_NOTE_DOC,
      this.UPLOAD_TYPES.TRUCKING_CREDIT_NOTE_DOC,
    ].includes(Number(type));
  }

  private async _getUploadApiRoute(type: number | string) {
    switch (Number(type)) {
      case this.UPLOAD_TYPES.FREIGHT_DOC:
        return API_ROUTES.DATA_MIGRATION.ACCOUNT_RECEIVABLE.FREIGHT_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_DOC:
        return API_ROUTES.DATA_MIGRATION.ACCOUNT_RECEIVABLE.TRUCKING_DOCUMENT;
      case this.UPLOAD_TYPES.FREIGHT_CREDIT_NOTE_DOC:
        return API_ROUTES.DATA_MIGRATION.ACCOUNT_RECEIVABLE
          .FREIGHT_CREDIT_NOTE_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_CREDIT_NOTE_DOC:
        return API_ROUTES.DATA_MIGRATION.ACCOUNT_RECEIVABLE
          .TRUCKING_CREDIT_NOTE_DOCUMENT;
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
