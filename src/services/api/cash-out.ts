import { sync } from '../core/sync';
import { API_ROUTES } from '../core/api-routes';
import { TEntryProcessorTypes, type TDataBatch } from '@/interfaces/data-batch';
import { queryOptions } from '@tanstack/react-query';

interface UploadData {
  companyId: string;
  dataFile: File;
}

interface UploadResponse extends TDataBatch {}

interface PostToDFOResponse {
  jobId: string;
  message: string;
}

/** The BullMQ queue every cash batch is posted through. */
export interface CashPostingQueueState {
  queueName: string;
  paused: boolean;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

const syncService = sync;

export class CashOut {
  public readonly mutationKey = ['cash-out-upload'];
  public readonly postingQueueQueryKey = ['cash-posting-queue'];
  public readonly UPLOAD_TYPES = {
    FREIGHT_DOC: TEntryProcessorTypes.CashOutFreight,
    TRUCKING_DOC: TEntryProcessorTypes.CashOutTrucking,
  };

  constructor() {}

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

  /** State of the queue that carries cash batches to D365FO. */
  public getPostingQueue = async (): Promise<CashPostingQueueState> => {
    return syncService.fetch<CashPostingQueueState>(
      API_ROUTES.DATA_MIGRATION.CASH.POSTING_QUEUE,
    );
  };

  /**
   * Stop handing cash posting jobs to the worker (admin only). Batches
   * submitted while the queue is paused wait in it.
   */
  public setPostingQueuePaused = async (
    paused: boolean,
  ): Promise<CashPostingQueueState> => {
    return syncService.save<CashPostingQueueState, void>(
      paused
        ? API_ROUTES.DATA_MIGRATION.CASH.POSTING_QUEUE_PAUSE
        : API_ROUTES.DATA_MIGRATION.CASH.POSTING_QUEUE_RESUME,
      undefined,
    );
  };

  public postingQueueQueryOptions = () =>
    queryOptions({
      queryKey: this.postingQueueQueryKey,
      queryFn: () => this.getPostingQueue(),
      refetchInterval: 10_000,
    });

  private async _getUploadApiRoute(type: number | string) {
    switch (Number(type)) {
      case this.UPLOAD_TYPES.FREIGHT_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH.CASH_OUT_FREIGHT_DOCUMENT;
      case this.UPLOAD_TYPES.TRUCKING_DOC:
        return API_ROUTES.DATA_MIGRATION.CASH.CASH_OUT_TRUCKING_DOCUMENT;
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
