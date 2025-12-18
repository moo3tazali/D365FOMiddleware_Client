import { ROUTES } from '@/router';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/cash-out/batch/')({
  component: undefined,
  beforeLoad: () => {
    throw redirect({
      to: ROUTES.DASHBOARD.CASH_OUT.HOME,
    });
  },
});
