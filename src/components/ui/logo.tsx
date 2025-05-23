import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

interface LogoProps extends ComponentProps<'div'> {}

export const Logo = ({ ...props }: LogoProps) => {
  return (
    <div
      {...props}
      className={cn(
        'text-base md:text-2xl font-bold',
        props.className
      )}
    >
      <Link to='/'>Logo</Link>
    </div>
  );
};
