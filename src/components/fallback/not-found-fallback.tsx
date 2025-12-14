import { Link, type NotFoundRouteProps } from '@tanstack/react-router';
import { ROUTES } from '@/router';

import type { ComponentProps } from 'react';
import SearchIcon from 'lucide-react/dist/esm/icons/search-slash';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NotFoundFallbackProps = NotFoundRouteProps &
  ComponentProps<'div'> & {
    to?: typeof ROUTES.PUBLIC.HOME | typeof ROUTES.DASHBOARD.HOME;
  };

export const NotFoundFallback = ({
  className,
  to,
  data,
  ...props
}: NotFoundFallbackProps) => {
  const message =
    data && typeof data === 'string'
      ? data
      : 'Oops! We couldn`t find that page.';
  return (
    <div
      {...props}
      className={cn(
        'flex flex-col gap-2 h-full w-full items-center justify-center',
        className
      )}
    >
      <SearchIcon className='size-28 sm:size-40 text-primary' strokeWidth={1} />
      <h1 className='text-center'>{message}</h1>
      <p className='text-center text-base md:text-lg'>
        Let’s get you back on track.
      </p>
      <Button
        asChild
        size='lg'
        className='w-full max-w-xs sm:max-w-sm font-bold !mt-5'
        variant='secondary'
      >
        <Link to={to || ROUTES.PUBLIC.HOME}>Take me home</Link>
      </Button>
    </div>
  );
};
