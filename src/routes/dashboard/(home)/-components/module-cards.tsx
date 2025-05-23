import { ROUTES, type TRoutes } from '@/router';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

export const ModuleCards = () => {
  const { modules } = useModuleItems();

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <h1 className='text-sm md:text-xl font-bold'>
        Select Module
      </h1>
      <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
        {modules.map(({ label, to }) => (
          <Module key={to} to={to}>
            {label}
          </Module>
        ))}
      </div>
      <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
    </div>
  );
};

const Module = ({
  children,
  to,
}: {
  children: React.ReactNode;
  to: TRoutes;
}) => {
  return (
    <Link to={to}>
      <div className='aspect-video rounded-xl bg-muted/50 flex items-center justify-center font-medium hover:bg-muted/70'>
        {children}
      </div>
    </Link>
  );
};

const useModuleItems = () => {
  const modules = useMemo(
    () => [
      {
        label: 'Accounts Payable',
        to: ROUTES.DASHBOARD.ACCOUNTS_PAYABLE.HOME,
      },
      {
        label: 'Accounts Receivable',
        to: ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.HOME,
      },
      {
        label: 'Cash Management',
        to: ROUTES.DASHBOARD.CASH_MANAGEMENT.HOME,
      },
    ],
    []
  );

  return { modules };
};
