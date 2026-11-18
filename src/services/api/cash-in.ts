import { sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';
import { TEntryProcessorTypes, type TDataBatch } from '@/interfaces/data-batch';
import { yardInvoiceApi } from './yard-invoice';

const YARD_REVIEW_POLL_MS = 3000;
const YARD_REVIEW_MAX_POLLS = 600;

interface UploadData {
  companyId: string;
  dataFile: File;
}

interface UploadResponse extends TDataBatch {}

interface PostToDFOResponse {
  jobId: string;
  message: string;
}

const syncService = sync;

export class CashIn {
  public readonly mutationKey = ['cash-in-upload'];
  public readonly UPLOAD_TYPES = {
    FREIGHT_DOC: TEntryProcessorTypes.CashInFreight,
    TRUCKING_DOC: TEntryProcessorTypes.CashInTrucking,
    SHIPLINK_DOC: TEntryProcessorTypes.CashInShiplink,
    YARD_DOC: TEntryProcessorTypes.CashInYard,
  };

  constructor() {}

  public upload = async (options: {
    type: number | string;
    data: UploadData;
    uploadProgress?: (prog: number) => void;
  }): Promise<UploadResponse> => {
    const { data, type } = options;

    // Yard files are reviewed by the Yard service, which creates the batch when the
    // review completes. The page then opens that batch like any other upload.
    if (Number(type) === this.UPLOAD_TYPES.YARD_DOC) {
      return this._uploadYard(data);
    }

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

  /** Starts the Yard review and waits until the batch exists. */
  private async _uploadYard(data: UploadData): Promise<UploadResponse> {
    const started = await yardInvoiceApi.startReview(
      data.dataFile,
      data.companyId,
    );
    for (let attempt = 0; attempt < YARD_REVIEW_MAX_POLLS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, YARD_REVIEW_POLL_MS));
      const job = await yardInvoiceApi.getJob(started.jobId);
      if (job.status === 'REVIEW_FAILED') {
        throw new Error(job.lastError ?? 'The workbook could not be reviewed.');
      }
      if (job.batchId) {
        // Return the full batch, as the other uploads do, so the batch page has every field.
        return syncService.fetch<TDataBatch>(
          API_ROUTES.DATA_MIGRATION.DATA_BATCH.ONE,
          { params: { batchId: job.batchId } },
        ) as Promise<UploadResponse>;
      }
    }
    throw new Error(
      'The Yard review is taking too long. Check the batch list.',
    );
  }

  private async _getUploadApiRoute(type: number | string) {
    switch (Number(type)) {
      case this.UPLOAD_TYPES.FREIGHT_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_FREIGHT_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_TRUCKING_DOCUMENT;
      case this.UPLOAD_TYPES.SHIPLINK_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_SHIPLINK_DOCUMENT;
      case this.UPLOAD_TYPES.YARD_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH.CASH_IN_YARD_DOCUMENT;
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
