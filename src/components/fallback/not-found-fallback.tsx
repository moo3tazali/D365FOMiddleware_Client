import {
  Link,
  type NotFoundRouteProps,
} from '@tanstack/react-router';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/router';

type NotFoundFallbackProps = NotFoundRouteProps &
  ComponentProps<'div'> & {
    to?:
      | typeof ROUTES.PUBLIC.HOME
      | typeof ROUTES.DASHBOARD.HOME;
  };

export const NotFoundFallback = ({
  className,
  to,
  ...props
}: NotFoundFallbackProps) => {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-col gap-3 h-full w-full text-[4vw] items-center justify-center',
        className
      )}
    >
      <h1>404 Not Found</h1>
      <Button
        asChild
        size='lg'
        className='w-full max-w-sm font-bold text-sm md:text-xl'
      >
        <Link to={to ?? ROUTES.PUBLIC.HOME}>Go Home</Link>
      </Button>
    </div>
  );
};
