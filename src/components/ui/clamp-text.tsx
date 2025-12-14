import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from '@/lib/utils';

export const ClampText = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger
        asChild
        className={cn('lg:line-clamp-2 cursor-text text-start', className)}
      >
        <div {...props}>{props.children}</div>
      </TooltipTrigger>
      <TooltipContent className='hidden lg:block'>
        {props.children}
      </TooltipContent>
    </Tooltip>
  );
};
