import { Frame } from '@/components/ui/frame';
import { ROUTES, type TRoutes } from '@/router';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
// import Landmark from 'lucide-react/dist/esm/icons/landmark';
import HandCoins from 'lucide-react/dist/esm/icons/hand-coins';
import Wallet from 'lucide-react/dist/esm/icons/wallet';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Users from 'lucide-react/dist/esm/icons/users';
import Settings from 'lucide-react/dist/esm/icons/settings';

export const ModuleCards = () => {
  const { modules } = useModuleItems();

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <h1 className='text-sm md:text-xl font-bold'>Select Module</h1>
      <div className='grid auto-rows-min gap-4 grid-cols-2 xl:grid-cols-4'>
        {modules.map(({ label, to, Icon }) => (
          <Module key={to} to={to}>
            <Icon className='size-8 sm:size-10' />
            {label}
          </Module>
        ))}
      </div>
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
      <Frame className='flex-col gap-4 text-sm sm:text-xl'>{children}</Frame>
    </Link>
  );
};

const useModuleItems = () => {
  const modules = useMemo(
    () => [
      // {
      //   label: 'Accounts Payable',
      //   to: ROUTES.DASHBOARD.ACCOUNTS_PAYABLE.HOME,
      //   Icon: Landmark,
      // },
      {
        label: 'Accounts Receivable',
        to: ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.HOME,
        Icon: HandCoins,
      },
      // {
      //   label: 'Cash Management',
      //   to: ROUTES.DASHBOARD.CASH_MANAGEMENT.HOME,
      //   Icon: Wallet,
      // },
      {
        label: 'Cash In',
        to: ROUTES.DASHBOARD.CASH_IN.HOME,
        Icon: Wallet,
      },
      {
        label: 'Ledger',
        to: ROUTES.DASHBOARD.LEDGER.HOME,
        Icon: BookOpen,
      },
      {
        label: 'Vendor',
        to: ROUTES.DASHBOARD.VENDOR.HOME,
        Icon: Users,
      },
      {
        label: 'Settings',
        to: ROUTES.DASHBOARD.SETTINGS.HOME,
        Icon: Settings,
      },
    ],
    []
  );

  return { modules };
};
