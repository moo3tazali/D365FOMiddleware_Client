import { Frame } from '@/components/ui/frame';
import { ROUTES, type TRoutes } from '@/router';
import { Link } from '@tanstack/react-router';
import { useMemo, type ComponentType } from 'react';
// import Landmark from 'lucide-react/dist/esm/icons/landmark';\
import HandCoins from 'lucide-react/dist/esm/icons/hand-coins';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Users from 'lucide-react/dist/esm/icons/users';
import Settings from 'lucide-react/dist/esm/icons/settings';
import CashIn from 'lucide-react/dist/esm/icons/banknote-arrow-down';
import CashOut from 'lucide-react/dist/esm/icons/banknote-arrow-up';

export const ModuleCards = () => {
  const { modules } = useModuleItems();

  return (
    <div className='flex flex-1 flex-col gap-5'>
      <div>
        <p className='text-xs font-semibold tracking-widest uppercase text-muted-foreground'>
          Select Module
        </p>
      </div>
      <div className='grid auto-rows-min gap-4 grid-cols-2 xl:grid-cols-4'>
        {modules.map(({ label, to, Icon }) => (
          <Module key={to} to={to} label={label} Icon={Icon} />
        ))}
      </div>
    </div>
  );
};

const Module = ({
  to,
  label,
  Icon,
}: {
  to: TRoutes;
  label: string;
  Icon: ComponentType<any>;
}) => {
  return (
    <Link
      to={to}
      className='group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    >
      <Frame className='flex-col gap-3 text-sm sm:text-base transition-all duration-150 group-hover:border-primary/30 group-hover:shadow-md group-hover:bg-muted/60 border border-border'>
        <Icon className='size-7 sm:size-8 text-primary/70 group-hover:text-primary transition-colors duration-150' />
        <span className='font-medium text-foreground'>{label}</span>
      </Frame>
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
        Icon: CashIn,
      },
      {
        label: 'Cash Out',
        to: ROUTES.DASHBOARD.CASH_OUT.HOME,
        Icon: CashOut,
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
    [],
  );

  return { modules };
};
