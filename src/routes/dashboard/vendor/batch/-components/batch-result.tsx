import { useMemo } from 'react';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal';
import CloudAlert from 'lucide-react/dist/esm/icons/cloud-alert';

import type { TDataBatch } from '@/interfaces/data-batch';
import { CloudCheck } from '@/assets/icons/cloud-check';
import { useBatchQueryData } from '../-hooks/use-batch-query-data';
import { Description } from '@/components/ui/description';
import { ROUTES } from '@/router';
import { BatchDFOStatus } from '@/routes/dashboard/accounts-receivable/batch/-components/batch-dfo-status';
import { BatchResultAlert } from '@/components/batch-result-alert';
import { cn } from '@/lib/utils';

export const BatchResult = () => {
  const [batch] = useBatchQueryData();

  const items = useResultItems(batch);

  return (
    <div className='flex-1 space-y-5'>
      <div className='flex items-center gap-3'>
        <div>
          <h3>Batch Results</h3>
          <Description>{batch?.description}</Description>
        </div>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {items.map(({ icon, color, total, label }) => (
          <StatCard
            key={label}
            icon={icon}
            color={color}
            total={total}
            label={label}
          />
        ))}
      </div>

      {batch && !!batch.totalUploadedCount && (
        <BatchResultAlert
          errorCount={batch.errorCount}
          batchId={batch.id}
          errorsRoute={ROUTES.DASHBOARD.VENDOR.BATCH.ERRORS}
        />
      )}

      {batch && (
        <BatchDFOStatus
          batch={batch}
          errorsRoute={ROUTES.DASHBOARD.VENDOR.BATCH.ERRORS}
        />
      )}
    </div>
  );
};

// â”€â”€ Stat card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface StatCardProps {
  icon: React.ReactNode;
  color: 'sky' | 'indigo' | 'emerald' | 'red';
  total: string;
  label: string;
}

const colorMap: Record<
  StatCardProps['color'],
  { border: string; bg: string; pip: string }
> = {
  sky: {
    border: 'border-sky-200 dark:border-sky-800/50',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    pip: 'bg-sky-400',
  },
  indigo: {
    border: 'border-indigo-200 dark:border-indigo-800/50',
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    pip: 'bg-indigo-400',
  },
  emerald: {
    border: 'border-emerald-200 dark:border-emerald-800/50',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    pip: 'bg-emerald-400',
  },
  red: {
    border: 'border-red-200 dark:border-red-800/50',
    bg: 'bg-red-50 dark:bg-red-950/20',
    pip: 'bg-red-400',
  },
};

const StatCard = ({ icon, color, total, label }: StatCardProps) => {
  const c = colorMap[color];
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl border p-4',
        c.border,
        c.bg,
      )}
    >
      {/* top row: number + icon */}
      <div className='flex items-start justify-between gap-2'>
        <span className='text-2xl font-bold tabular-nums tracking-tight text-foreground'>
          {total}
        </span>
        <div className='shrink-0'>{icon}</div>
      </div>
      {/* bottom row: label + pip */}
      <div className='flex items-center gap-2'>
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', c.pip)} />
        <span className='text-xs font-medium text-muted-foreground'>
          {label}
        </span>
      </div>
    </div>
  );
};

const useResultItems = (entries?: TDataBatch | null) => {
  const defaultTotal = '--';
  return useMemo(
    () => [
      {
        label: 'Total Uploaded',
        total:
          entries?.totalUploadedCount?.toLocaleString('en-US') || defaultTotal,
        color: 'sky' as const,
        icon: <UploadCloud className='size-5 text-sky-500 dark:text-sky-400' />,
      },
      {
        label: 'Total Formatted',
        total:
          entries?.totalFormattedCount?.toLocaleString('en-US') || defaultTotal,
        color: 'indigo' as const,
        icon: (
          <SlidersHorizontal className='size-5 text-indigo-500 dark:text-indigo-400' />
        ),
      },
      {
        label: 'Success Count',
        total: entries?.successCount?.toLocaleString('en-US') || defaultTotal,
        color: 'emerald' as const,
        icon: (
          <CloudCheck className='size-5 text-emerald-500 dark:text-emerald-400' />
        ),
      },
      {
        label: 'Error Count',
        total: entries?.errorCount?.toLocaleString('en-US') || defaultTotal,
        color: 'red' as const,
        icon: <CloudAlert className='size-5 text-red-500 dark:text-red-400' />,
      },
    ],
    [entries],
  );
};
