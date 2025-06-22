import { ROUTES } from '@/router';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/accounts-receivable/batch/')({
  component: undefined,
  beforeLoad: () => {
    throw redirect({
      to: ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.HOME,
    });
  },
});
