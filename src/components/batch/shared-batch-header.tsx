import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

import { Description } from '@/components/ui/description';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useServices } from '@/hooks/use-services';
import { useInvalidate } from '@/hooks/use-invalidate';
import { enumToOptions } from '@/lib/utils';
import { TDataBatchStatus, type TDataBatch } from '@/interfaces/data-batch';
import { BatchActionsDropdown } from '@/components/batch/batch-actions-dropdown';
import { useAuth } from '@/hooks/use-auth';
import {
  BatchCreatedBy,
  formatBatchDate,
} from '@/components/batch/batch-audit';

const statusOptions = enumToOptions(TDataBatchStatus);
const statusColorMap = {
  [TDataBatchStatus.PendingPosting]: 'warning',
  [TDataBatchStatus.Posting]: 'info',
  [TDataBatchStatus.Posted]: 'success',
  [TDataBatchStatus.Canceled]: 'destructive',
  [TDataBatchStatus.Revalidating]: 'info',
} as const;

interface SharedBatchHeaderProps {
  batch?: TDataBatch;
}

export const SharedBatchHeader = ({ batch }: SharedBatchHeaderProps) => {
  const isAdmin = useAuth((state) => state.user?.role === 'ADMIN');

  return (
    <div className='flex flex-col items-start justify-between gap-4 sm:flex-row'>
      <div className='min-w-0'>
        <div className='flex items-center gap-2'>
          <h1 className='truncate'>
            {batch ? `Batch ${batch.id}` : 'Batch Entries'}
          </h1>
          {batch != null && (
            <Badge
              dot
              variant='ghost'
              color={
                statusColorMap[batch.status as keyof typeof statusColorMap]
              }
            >
              {statusOptions.find(({ value }) => value === batch.status)
                ?.label ?? ''}
            </Badge>
          )}
          <BatchRefreshBtn />
        </div>
        <Description>
          {batch?.description || 'Batch entries to synchronize with Dynamics.'}
        </Description>

        {batch && (
          <dl className='mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm'>
            <BatchMetadata label='Created by'>
              <BatchCreatedBy batch={batch} />
            </BatchMetadata>
            <BatchMetadata label='Created at'>
              {formatBatchDate(batch.creationDate)}
            </BatchMetadata>
            {isAdmin && (
              <>
                <BatchMetadata label='Reprocessed'>
                  {batch.reprocessCount.toLocaleString('en-US')} times
                </BatchMetadata>
                {batch.lastReprocessedAt && (
                  <BatchMetadata label='Last reprocessed'>
                    {formatBatchDate(batch.lastReprocessedAt)}
                    {batch.lastReprocessedByName
                      ? ` by ${batch.lastReprocessedByName}`
                      : ''}
                  </BatchMetadata>
                )}
              </>
            )}
          </dl>
        )}
      </div>

      <BatchActionsDropdown batch={batch} />
    </div>
  );
};

const BatchMetadata = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className='min-w-0'>
    <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
    <dd className='mt-0.5 text-foreground'>{children}</dd>
  </div>
);

const BatchRefreshBtn = () => {
  const { dataBatch } = useServices();
  const { invalidate } = useInvalidate();
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => invalidate(dataBatch.queryKey)}
        >
          <RefreshCw className='size-5 md:size-7' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='bottom' className='hidden lg:block'>
        Refresh Data
      </TooltipContent>
    </Tooltip>
  );
};
