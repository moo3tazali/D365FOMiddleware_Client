import { Navigate } from '@tanstack/react-router';

import { ROUTES } from '@/router';

type Props = {
  children: React.ReactNode;
};
export const AuthGuard = ({ children }: Props) => {
  // TODO: Implement authentication logic
  const isAuthenticated = true;

  return isAuthenticated ? (
    children
  ) : (
    <Navigate
      to={ROUTES.AUTH.LOGIN}
      search={{ redirect: location.pathname }}
    />
  );
};
