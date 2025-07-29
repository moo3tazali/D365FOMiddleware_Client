import type { ComponentProps } from 'react';
import LoaderCircle from 'lucide-react/dist/esm/icons/loader-circle';

import { cn } from '@/lib/utils';

export const LoadingFallback = ({
  className,
  ...props
}: ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-2.5 bg-muted-foreground/20 dark:bg-muted/40 text-muted-foreground',
        className
      )}
    >
      <LoaderCircle className='animate-spin size-[clamp(2rem,4vw,4rem)]' />
      <span className='text-[clamp(1rem,4vw,2rem)]'>Loading...</span>
    </div>
  );
};
