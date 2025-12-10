import { useMemo } from 'react';
import { useLocation } from '@tanstack/react-router';
import Home from 'lucide-react/dist/esm/icons/home';
import Landmark from 'lucide-react/dist/esm/icons/landmark';
import HandCoins from 'lucide-react/dist/esm/icons/hand-coins';
import Wallet from 'lucide-react/dist/esm/icons/wallet';
import Settings from 'lucide-react/dist/esm/icons/settings';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Users from 'lucide-react/dist/esm/icons/users';

import { ROUTES } from '@/router';

export const useNavItems = () => {
  const { pathname } = useLocation();

  const items = useMemo(
    () => [
      {
        title: 'Home',
        url: ROUTES.DASHBOARD.HOME,
        icon: Home,
        isActive: pathname === ROUTES.DASHBOARD.HOME,
      },
      {
        title: 'Accounts Payable',
        url: ROUTES.DASHBOARD.ACCOUNTS_PAYABLE.HOME,
        icon: Landmark,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.ACCOUNTS_PAYABLE.HOME),
      },
      {
        title: 'Accounts Receivable',
        url: ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.HOME,
        icon: HandCoins,
        isActive: pathname.startsWith(
          ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.HOME
        ),
      },
      {
        title: 'Cash Management',
        url: ROUTES.DASHBOARD.CASH_MANAGEMENT.HOME,
        icon: Wallet,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.CASH_MANAGEMENT.HOME),
      },
      {
        title: 'Ledger',
        url: ROUTES.DASHBOARD.LEDGER.HOME,
        icon: BookOpen,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.LEDGER.HOME),
      },
      {
        title: 'Vendor',
        url: ROUTES.DASHBOARD.VENDOR.HOME,
        icon: Users,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.VENDOR.HOME),
      },
      {
        title: 'Settings',
        url: ROUTES.DASHBOARD.SETTINGS.HOME,
        icon: Settings,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.SETTINGS.HOME),
      },
    ],
    [pathname]
  );

  return { items };
};
