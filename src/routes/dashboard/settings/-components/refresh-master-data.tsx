import { useServices } from '@/hooks/use-services';
import { Button } from '@/components/ui/button';
import { useMutation } from '@/hooks/use-mutation';
import type { MasterDataPayload, SyncType } from '@/services/api/master-data';
import { Suspense, useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  SyncJobStatus,
  type IMasterDataSyncJobResponse,
  type IMasterDataSyncStatus,
} from '@/interfaces/master-data';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvalidate } from '@/hooks/use-invalidate';

export const RefreshMasterData = () => {
  return (
    <section className='space-y-3'>
      <h2>Refresh Settings</h2>
      <Suspense fallback={<RefreshMasterDataSkeleton />}>
        <SettingsRows />
      </Suspense>
    </section>
  );
};

const SettingsRows = () => {
  const { masterData } = useServices();

  const { data } = useSuspenseQuery(masterData.getSyncListQueryOptions());

  const { invalidate } = useInvalidate();

  const isSyncing = data.some(
    (item) =>
      item.status === SyncJobStatus.PROCESSING ||
      item.status === SyncJobStatus.PENDING
  );

  useEffect(() => {
    let interval: number | undefined = undefined;

    if (isSyncing) {
      interval = setInterval(() => {
        // eslint-disable-next-line no-console
        console.info('invalidating master data');
        invalidate(masterData.queryKey);
      }, 30000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => clearInterval(interval);
  }, [isSyncing, invalidate, masterData.queryKey]);

  return (
    <div className='space-y-3'>
      {data.map((item, idx) => (
        <SettingsRow
          key={idx}
          data={item}
          mutationFn={masterData.sync}
          queryKey={masterData.queryKey}
        />
      ))}
    </div>
  );
};

interface RefreshSettingsRowProps {
  data: IMasterDataSyncStatus;
  mutationFn: (data: {
    type: SyncType;
    payload: MasterDataPayload;
  }) => Promise<IMasterDataSyncJobResponse>;
  queryKey: string[];
}

const statusLabelMap: Record<SyncJobStatus, string> = {
  [SyncJobStatus.PENDING]: 'Pending',
  [SyncJobStatus.PROCESSING]: 'Processing',
  [SyncJobStatus.SUCCESS]: 'Ready',
  [SyncJobStatus.FAILED]: 'Failed',
};

const statusColorMap: Record<
  SyncJobStatus,
  'warning' | 'info' | 'success' | 'destructive'
> = {
  [SyncJobStatus.PENDING]: 'warning',
  [SyncJobStatus.PROCESSING]: 'info',
  [SyncJobStatus.SUCCESS]: 'success',
  [SyncJobStatus.FAILED]: 'destructive',
};

const SettingsRow = ({
  data,
  mutationFn,
  queryKey,
}: RefreshSettingsRowProps) => {
  const { label, status, syncType, errorMessage } = data || {};

  const { mutate, isPending } = useMutation({
    operationName: `Refresh ${label}`,
    mutationFn,
    refetchQueries: [queryKey],
    disableToast: true,
  });

  const onRefresh = () => {
    mutate({
      type: syncType,
      payload: {
        company: 'm-p',
        chartOfAccounts: 'Chart of Accounts',
        rateType: 'default',
      },
    });
  };

  const statusLabel = statusLabelMap[status] ?? status;
  const statusColor = statusColorMap[status];

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <div className='w-40 font-medium text-sm sm:text-base'>{label}</div>
        <div className='w-14'>
          <Badge
            dot
            variant='ghost'
            color={statusColor}
            size='small'
            className='shrink-0 '
          >
            {statusLabel}
          </Badge>
        </div>

        <Button
          className='block ms-12'
          variant='outline'
          type='button'
          onClick={onRefresh}
          disabled={
            isPending ||
            status === SyncJobStatus.PROCESSING ||
            status === SyncJobStatus.PENDING
          }
        >
          {isPending ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      {errorMessage && (
        <Alert variant='destructive' className='w-96'>
          <AlertCircleIcon />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const RefreshMasterDataSkeleton = () => {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className='flex items-center gap-3'>
          <Skeleton className='w-40 h-5' />
          <div className='w-14'>
            <Skeleton className='w-20 h-5 rounded-full' />
          </div>
          <Skeleton className='w-20 h-9 ms-12' />
        </div>
      ))}
    </div>
  );
};
