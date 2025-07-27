import { useMemo } from 'react';
import { useLocation } from '@tanstack/react-router';
import {
  Home,
  Landmark,
  HandCoins,
  Wallet,
  Settings,
  BookOpen,
} from 'lucide-react';

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
