'use client';

import { cva, type VariantProps } from 'class-variance-authority';
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
        success: 'bg-green-500 dark:bg-green-600 text-white',
        info: 'bg-blue-500 dark:bg-blue-600 text-white',
        warning: 'bg-yellow-500 dark:bg-yellow-400 text-black',
        muted: 'bg-muted text-muted-foreground',
        gray: 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100',
        pink: 'bg-pink-500 dark:bg-pink-600 text-white',
        sky: 'bg-sky-500 dark:bg-sky-600 text-white',
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
          'text-primary border-primary bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'secondary',
        className:
          'text-secondary-foreground border-secondary-foreground bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'destructive',
        className:
          'text-destructive border-destructive bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'success',
        className:
          'text-green-500 dark:text-green-600 border-green-500 dark:border-green-600 bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'info',
        className:
          'text-blue-500 dark:text-blue-600 border-blue-500 dark:border-blue-600 bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'warning',
        className:
          'text-yellow-500 dark:text-yellow-600 border-yellow-500 dark:border-yellow-600 bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'sky',
        className:
          'text-sky-500 dark:text-sky-600 border-sky-500 dark:border-sky-600 bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'gray',
        className:
          'text-gray-500 dark:text-gray-400 border-gray-500 dark:border-gray-400 bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'pink',
        className:
          'text-pink-500 dark:text-pink-600 border-pink-500 dark:border-pink-600 bg-transparent dark:bg-transparent',
      },
      {
        variant: 'outline',
        color: 'muted',
        className:
          'text-muted-foreground border-muted-foreground bg-transparent dark:bg-transparent',
      },
      {
        variant: 'ghost',
        color: 'primary',
        className: 'bg-transparent dark:bg-transparent text-primary',
      },
      {
        variant: 'ghost',
        color: 'secondary',
        className:
          'bg-transparent dark:bg-transparent text-secondary-foreground',
      },
      {
        variant: 'ghost',
        color: 'destructive',
        className: 'bg-transparent dark:bg-transparent text-destructive',
      },
      {
        variant: 'ghost',
        color: 'success',
        className:
          'bg-transparent dark:bg-transparent text-green-500 dark:text-green-600',
      },
      {
        variant: 'ghost',
        color: 'info',
        className:
          'bg-transparent dark:bg-transparent text-blue-500 dark:text-blue-600',
      },
      {
        variant: 'ghost',
        color: 'warning',
        className:
          'bg-transparent dark:bg-transparent text-yellow-500 dark:text-yellow-600',
      },
      {
        variant: 'ghost',
        color: 'muted',
        className:
          'bg-transparent dark:bg-transparent text-muted-foreground dark:text-muted-foreground',
      },
      {
        variant: 'ghost',
        color: 'gray',
        className:
          'bg-transparent dark:bg-transparent text-gray-500 dark:text-gray-400',
      },
      {
        variant: 'ghost',
        color: 'pink',
        className:
          'bg-transparent dark:bg-transparent text-pink-500 dark:text-pink-600',
      },
      {
        variant: 'ghost',
        color: 'sky',
        className:
          'bg-transparent dark:bg-transparent text-sky-500 dark:text-sky-600',
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
  ({ className, variant, size, dot, color, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot, color }), className)}
        {...props}
      >
        {dot && <span className={cn('h-2 w-2 rounded-full bg-current')} />}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
