import type { TDataBatch } from '@/interfaces/data-batch';
import { createUploadStore } from '@/store/upload-store';

export const useUploadEntriesStore =
  createUploadStore<TDataBatch>();
