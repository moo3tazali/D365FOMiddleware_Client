import { create } from 'zustand';

export interface TUploadStore<TData = null> {
  dataBatch: TData | null;
  setDataBatch: (dataBatch: TData | null) => void;
}

export function createUploadStore<TData>() {
  return create<TUploadStore<TData>>((set) => ({
    dataBatch: null,
    setDataBatch: (dataBatch) => set({ dataBatch }),
  }));
}
