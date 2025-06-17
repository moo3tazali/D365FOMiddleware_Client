'use client';

import {
  cva,
  type VariantProps,
} from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        outline: 'border border-input bg-transparent',
        ghost: 'bg-transparent',
      },
      color: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-white',
        success: 'bg-green-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black',
        muted: 'bg-muted text-muted-foreground',
        gray: 'bg-gray-300 text-gray-800',
        pink: 'bg-pink-500 text-white',
        sky: 'bg-sky-500 text-white',
      },
      size: {
        small: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-sm',
        large: 'px-3 py-1 text-sm',
      },
      dot: {
        true: 'pl-1.5',
      },
    },
    compoundVariants: [
      {
        variant: 'outline',
        color: 'primary',
        className:
          'text-primary border-primary bg-transparent',
      },
      {
        variant: 'outline',
        color: 'secondary',
        className:
          'text-secondary-foreground border-secondary-foreground bg-transparent',
      },
      {
        variant: 'outline',
        color: 'destructive',
        className:
          'text-destructive border-destructive bg-transparent',
      },
      {
        variant: 'outline',
        color: 'success',
        className:
          'text-green-500 border-green-500 bg-transparent',
      },
      {
        variant: 'outline',
        color: 'info',
        className:
          'text-blue-500 border-blue-500 bg-transparent',
      },
      {
        variant: 'outline',
        color: 'warning',
        className:
          'text-yellow-500 border-yellow-500 bg-transparent',
      },
      {
        variant: 'outline',
        color: 'sky',
        className:
          'text-sky-500 border-sky-500 bg-transparent',
      },
      {
        variant: 'outline',
        color: 'gray',
        className:
          'text-gray-500 border-gray-500 bg-transparent',
      },
      {
        variant: 'outline',
        color: 'pink',
        className:
          'text-pink-500 border-pink-500 bg-transparent',
      },
      {
        variant: 'outline',
        color: 'muted',
        className:
          'text-muted-foreground border-muted-foreground bg-transparent',
      },
      {
        variant: 'ghost',
        color: 'primary',
        className: 'bg-transparent text-primary',
      },
      {
        variant: 'ghost',
        color: 'secondary',
        className:
          'bg-transparent text-secondary-foreground',
      },
      {
        variant: 'ghost',
        color: 'destructive',
        className: 'bg-transparent text-destructive',
      },
      {
        variant: 'ghost',
        color: 'success',
        className: 'bg-transparent text-green-500',
      },
      {
        variant: 'ghost',
        color: 'info',
        className: 'bg-transparent text-blue-500',
      },
      {
        variant: 'ghost',
        color: 'warning',
        className: 'bg-transparent text-yellow-500',
      },
      {
        variant: 'ghost',
        color: 'muted',
        className: 'bg-transparent text-muted-foreground',
      },
      {
        variant: 'ghost',
        color: 'gray',
        className: 'bg-transparent text-gray-500',
      },
      {
        variant: 'ghost',
        color: 'pink',
        className: 'bg-transparent text-pink-500',
      },
      {
        variant: 'ghost',
        color: 'sky',
        className: 'bg-transparent text-sky-500',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      color: 'primary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  color?:
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'success'
    | 'info'
    | 'warning'
    | 'muted'
    | 'gray'
    | 'pink'
    | 'sky';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      dot,
      color,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, dot, color }),
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-2 w-2 rounded-full bg-current'
            )}
          />
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
