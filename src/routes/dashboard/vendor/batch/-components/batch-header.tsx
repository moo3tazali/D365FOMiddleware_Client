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

const statusOptions = enumToOptions(TDataBatchStatus);
const statusColorMap = {
  [TDataBatchStatus.Pending]: 'warning',
  [TDataBatchStatus.Processing]: 'info',
  [TDataBatchStatus.Completed]: 'success',
  [TDataBatchStatus.Canceled]: 'destructive',
} as const;

interface BatchHeaderProps {
  batch?: TDataBatch;
}

export const BatchHeader = ({ batch }: BatchHeaderProps) => {
  return (
    <div>
      <div className='flex flex-wrap items-end gap-2 sm:gap-3'>
        <div className='flex items-end gap-2'>
          <h1>Batch Entries</h1>
          {batch != null && (
            <Badge
              dot
              variant='ghost'
              color={statusColorMap[batch.status as keyof typeof statusColorMap]}
            >
              {statusOptions.find(({ value }) => value === batch.status)
                ?.label ?? ''}
            </Badge>
          )}
        </div>
        <BatchRefreshBtn />
      </div>
      <Description>Batch entries to synchronize with Dynamics.</Description>
    </div>
  );
};

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
      <TooltipContent side='right' className='hidden lg:block'>
        Refresh Data
      </TooltipContent>
    </Tooltip>
  );
};
