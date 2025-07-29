import type { ComponentProps } from 'react';

import { Link } from '@tanstack/react-router';

import { ROUTES, type TRoutes } from '@/router';
import { LogoVertical } from '@/assets/icons/logo-v';
import { LogoHorizontal } from '@/assets/icons/logo-h';

interface LogoProps extends ComponentProps<'svg'> {
  to?: TRoutes;
  orientation?: 'horizontal' | 'vertical';
}

export const Logo = ({ to, orientation, ...props }: LogoProps) => {
  return (
    <Link to={to || ROUTES.PUBLIC.HOME}>
      {orientation === 'vertical' ? (
        <LogoVertical {...props} />
      ) : (
        <LogoHorizontal {...props} />
      )}
    </Link>
  );
};
