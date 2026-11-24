import { useServices } from '@/hooks/use-services';
import { Button } from '@/components/ui/button';
import { useMutation } from '@/hooks/use-mutation';
import type { MasterDataPayload, SyncType } from '@/services/api/master-data';
import { SYNC_SCOPE } from '@/services/api/master-data';
import { Suspense, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COMPANY_OPTIONS, type CompanyCode } from '@/constants/company';

const SYNC_POLL_INTERVAL_MS = 5000;

const isRunning = (status: SyncJobStatus) =>
  status === SyncJobStatus.PENDING || status === SyncJobStatus.PROCESSING;

export const RefreshMasterData = () => {
  const [company, setCompany] = useState<CompanyCode | ''>('');

  return (
    <section className='space-y-3'>
      <h2>Refresh Settings</h2>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <span className='text-sm font-medium'>Company</span>
        <Select
          value={company || undefined}
          onValueChange={(value) => setCompany(value as CompanyCode)}
        >
          <SelectTrigger className='w-64' aria-label='Refresh company'>
            <SelectValue placeholder='Select the company to refresh' />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='text-xs text-muted-foreground'>
          Shared datasets (main accounts, exchange rates, financial dimensions)
          are one set for all companies; their applicability is chosen per
          company. Company datasets are stored per company. Status shows the
          latest job for each dataset.
        </p>
      </div>
      <Suspense fallback={<RefreshMasterDataSkeleton />}>
        <SettingsRows company={company} />
      </Suspense>
    </section>
  );
};

const SettingsRows = ({ company }: { company: CompanyCode | '' }) => {
  const { masterData } = useServices();

  const { data } = useSuspenseQuery({
    ...masterData.getSyncListQueryOptions(),
    // Keep polling while any sync job is queued or running, then stop.
    refetchInterval: (query) =>
      query.state.data?.some((item) => isRunning(item.status))
        ? SYNC_POLL_INTERVAL_MS
        : false,
  });

  return (
    <div className='space-y-3'>
      {data.map((item) => (
        <SettingsRow
          key={item.syncType}
          data={item}
          company={company}
          mutationFn={masterData.sync}
          queryKey={masterData.queryKey}
        />
      ))}
    </div>
  );
};

interface RefreshSettingsRowProps {
  data: IMasterDataSyncStatus;
  company: CompanyCode | '';
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
  company,
  mutationFn,
  queryKey,
}: RefreshSettingsRowProps) => {
  const { label, status, syncType, errorMessage } = data || {};

  const { mutate, isPending } = useMutation({
    operationName: `Refresh ${label}`,
    mutationFn,
    refetchQueries: [queryKey],
    toastMsgs: {
      loading: `Starting ${label} refresh...`,
      success: `${label} refresh started`,
    },
  });

  const scope = SYNC_SCOPE[syncType as SyncType];

  const onRefresh = () => {
    if (!company) return;
    // M-P keeps its legacy chart and rate type. Other companies read theirs from
    // their synced ledger on the server, so nothing is borrowed from M-P.
    mutate({
      type: syncType,
      payload:
        company === 'm-p'
          ? {
              company,
              chartOfAccounts: 'Chart of Accounts',
              rateType: 'default',
            }
          : { company },
    });
  };

  const statusLabel = statusLabelMap[status] ?? status;
  const statusColor = statusColorMap[status];

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <div className='w-40 font-medium text-sm sm:text-base'>
          {label}
          <span className='block text-xs text-muted-foreground'>
            {scope === 'shared' ? 'Shared' : 'Company'}
          </span>
        </div>
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
            !company ||
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
