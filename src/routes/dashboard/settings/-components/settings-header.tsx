import { useInvalidate } from '@/hooks/use-invalidate';
import { useServices } from '@/hooks/use-services';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

export const SettingsHeader = () => {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center gap-5 flex-wrap'>
      <h1>Settings</h1>
      <RefreshBtn />
    </div>
  );
};

const RefreshBtn = () => {
  const { masterData, appSetting } = useServices();

  const { refetch } = useInvalidate();

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            void Promise.all([
              refetch(masterData.queryKey),
              refetch(appSetting.queryKey),
            ]);
          }}
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
