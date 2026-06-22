import { Link } from '@tanstack/react-router';
import Upload from 'lucide-react/dist/esm/icons/upload';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useServices } from '@/hooks/use-services';
import { useInvalidate } from '@/hooks/use-invalidate';

interface SharedDataBatchHeaderProps {
  title: string;
  newUploadLink: string;
}

export const SharedDataBatchHeader = ({
  title,
  newUploadLink,
}: SharedDataBatchHeaderProps) => {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap'>
      <div className='flex gap-2 items-center'>
        <h1>{title}</h1>
        <RefreshBtn />
      </div>

      <div className='flex-1 flex justify-end gap-4'>
        <Button asChild className='w-full sm:max-w-xs' size='lg'>
          <Link to={newUploadLink}>
            <Upload className='size-5' />
            Upload Entries
          </Link>
        </Button>
      </div>
    </div>
  );
};

const RefreshBtn = () => {
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
      <TooltipContent side='right'>Refresh Data</TooltipContent>
    </Tooltip>
  );
};
