import { useMemo } from 'react';
import { UploadCloud, SlidersHorizontal, CloudAlert } from 'lucide-react';

import { Frame } from '@/components/ui/frame';
import { useBatchStore } from '../-hooks/use-batch-store';
import type { TDataBatch } from '@/interfaces/data-batch';
import { CloudCheck } from '@/assets/icons/cloud-check';
import { useBatchQueryData } from '../-hooks/use-batch-query-data';

export const BatchResult = () => {
  const batch = useBatchStore((s) => s.dataBatch);
  const queryBatch = useBatchQueryData();

  const items = useResultItems(batch || queryBatch);

  return (
    <div className='flex-1 space-y-5'>
      <h3>Batch Results</h3>
      <div className='grid grid-cols-fit-175 sm:grid-cols-fit-250 gap-2.5'>
        {items.map(({ Icon, total, label }) => (
          <Frame className='flex-col gap-5 items-stretch p-5 md:p-10 justify-between'>
            <div className='flex items-center justify-between'>
              <span className='text-[clamp(1rem,1.5vw,1.5rem)]'>{total}</span>
              <Icon />
            </div>
            <span className='text-[clamp(1rem,1.5vw,1.5rem)]'>{label}</span>
          </Frame>
        ))}
      </div>
    </div>
  );
};

const UploadedIcon = () => (
  <div className='bg-sky-100 dark:bg-sky-800/20 rounded-full p-2 md:p-4'>
    <UploadCloud className='text-sky-500 dark:text-sky-400 size-[clamp(1.75rem,2vw,4rem)]' />
  </div>
);

const FormattedIcon = () => (
  <div className='bg-indigo-100 dark:bg-indigo-800/20 rounded-full p-2 md:p-4'>
    <SlidersHorizontal className='text-indigo-500 dark:text-indigo-400 size-[clamp(1.75rem,2vw,4rem)]' />
  </div>
);

const SuccessIcon = () => (
  <div className='bg-emerald-100 dark:bg-emerald-800/20 rounded-full p-2 md:p-4'>
    <CloudCheck className='text-emerald-500 dark:text-emerald-400 size-[clamp(1.75rem,2vw,4rem)]' />
  </div>
);

const ErrorIcon = () => (
  <div className='bg-red-100 dark:bg-red-800/20 rounded-full p-2 md:p-4'>
    <CloudAlert className='text-red-500 dark:text-red-400 size-[clamp(1.75rem,2vw,4rem)]' />
  </div>
);

const useResultItems = (entries?: TDataBatch | null) => {
  const defaultTotal = '--';
  return useMemo(
    () =>
      [
        {
          label: 'Total Uploaded',
          total:
            entries?.totalUploadedCount?.toLocaleString('en-US') ||
            defaultTotal,
          Icon: UploadedIcon,
        },
        {
          label: 'Total Formatted',
          total:
            entries?.totalFormattedCount?.toLocaleString('en-US') ||
            defaultTotal,
          Icon: FormattedIcon,
        },
        {
          label: 'Success Count',
          total: entries?.successCount?.toLocaleString('en-US') || defaultTotal,
          Icon: SuccessIcon,
        },
        {
          label: 'Error Count',
          total: entries?.errorCount?.toLocaleString('en-US') || defaultTotal,
          Icon: ErrorIcon,
        },
      ] satisfies {
        label: string;
        total: string;
        Icon: React.ElementType;
      }[],
    [entries]
  );
};
