import type { ComponentProps } from 'react';
import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

export const LoadingFallback = ({
  className,
  ...props
}: ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={cn(
        'flex p-10 items-center justify-center',
        className
      )}
    >
      <LoaderCircle className='animate-spin size-40' />
    </div>
  );
};
