import { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import Home from 'lucide-react/dist/esm/icons/home';
import HandCoins from 'lucide-react/dist/esm/icons/hand-coins';
import Settings from 'lucide-react/dist/esm/icons/settings';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Users from 'lucide-react/dist/esm/icons/users';
import CashIn from 'lucide-react/dist/esm/icons/banknote-arrow-down';
import CashOut from 'lucide-react/dist/esm/icons/banknote-arrow-up';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Server from 'lucide-react/dist/esm/icons/server';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import CircleUser from 'lucide-react/dist/esm/icons/circle-user';

import Landmark from 'lucide-react/dist/esm/icons/landmark';

import { ROUTES } from '@/router';
import { useAuth } from '@/hooks/use-auth';
import { useServices } from '@/hooks/use-services';

export const useNavItems = () => {
  const { pathname } = useLocation();
  const user = useAuth((state) => state.user);
  const { accessAdmin } = useServices();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    accessAdmin
      .list('PENDING')
      .then((response) => setPendingCount(response.items.length))
      .catch(() => setPendingCount(0));
  }, [accessAdmin, user?.role]);

  const items = useMemo(
    () => [
      {
        title: 'Home',
        url: ROUTES.DASHBOARD.HOME,
        icon: Home,
        isActive: pathname === ROUTES.DASHBOARD.HOME,
      },
      {
        title: 'Bank Mapping',
        url: ROUTES.DASHBOARD.BANK_MAPPING.HOME,
        icon: Landmark,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.BANK_MAPPING.HOME),
      },
      {
        title: 'Accounts Receivable',
        url: ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.HOME,
        icon: HandCoins,
        isActive: pathname.startsWith(
          ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.HOME,
        ),
      },
      {
        title: 'Ledger',
        url: ROUTES.DASHBOARD.LEDGER.HOME,
        icon: BookOpen,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.LEDGER.HOME),
      },
      {
        title: 'Cash In',
        url: ROUTES.DASHBOARD.CASH_IN.HOME,
        icon: CashIn,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.CASH_IN.HOME),
      },
      {
        title: 'Cash Out',
        url: ROUTES.DASHBOARD.CASH_OUT.HOME,
        icon: CashOut,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.CASH_OUT.HOME),
      },
      {
        title: 'Vendor',
        url: ROUTES.DASHBOARD.VENDOR.HOME,
        icon: Users,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.VENDOR.HOME),
      },
      {
        title: 'Profile',
        url: ROUTES.DASHBOARD.PROFILE.HOME,
        icon: CircleUser,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.PROFILE.HOME),
      },
      {
        title: 'Settings',
        url: ROUTES.DASHBOARD.SETTINGS.HOME,
        icon: Settings,
        isActive: pathname.startsWith(ROUTES.DASHBOARD.SETTINGS.HOME),
      },
      ...(user?.role === 'ADMIN'
        ? [
            {
              title: `Access requests${pendingCount ? ` (${pendingCount})` : ''}`,
              url: ROUTES.DASHBOARD.ACCESS.HOME,
              icon: UserCheck,
              isActive: pathname.startsWith(ROUTES.DASHBOARD.ACCESS.HOME),
            },
            {
              title: 'Queues',
              url: ROUTES.DASHBOARD.QUEUES.HOME,
              icon: Server,
              isActive: pathname.startsWith(ROUTES.DASHBOARD.QUEUES.HOME),
            },
            {
              title: 'Observability',
              url: ROUTES.DASHBOARD.OBSERVABILITY.HOME,
              icon: Activity,
              isActive: pathname.startsWith(
                ROUTES.DASHBOARD.OBSERVABILITY.HOME,
              ),
            },
          ]
        : []),
    ],
    [pathname, pendingCount, user?.role],
  );

  return { items };
};
