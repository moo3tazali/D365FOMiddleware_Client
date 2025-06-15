'use client';

import { cn } from '@/lib/utils';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

interface Props {
  progress?: number;
  size: 'xs' | 'sm' | 'md' | 'lg';
}

export const Progress: React.FC<Props> = ({
  progress,
  size = 'md',
}) => {
  const sizes = {
    xs: 'h-0.5',
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };
  return (
    <div className='w-full'>
      <style>
        {`@keyframes progress {
            to {
              left: calc(100% - 2rem);
            }
          }
          .progress {
            transform-origin: center;
            animation: progress 1.25s ease-in-out infinite;
          }
          `}
      </style>
      <ProgressPrimitive.Root
        className={cn(
          'relative h-0.5 w-full overflow-hidden rounded-full bg-primary/20',
          sizes[size]
        )}
      >
        <ProgressPrimitive.Indicator
          className='relative h-full w-full flex-1 bg-primary transition-all'
          style={{
            transform: `translateX(-${
              100 - (progress || 0)
            }%)`,
          }}
        >
          <div className='absolute left-0 w-6 h-full bg-primary-foreground blur-[10px] inset-y-0 progress' />
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    </div>
  );
};
