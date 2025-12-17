import { ROUTES } from '@/router';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/cash-in/batch/')({
  component: undefined,
  beforeLoad: () => {
    throw redirect({
      to: ROUTES.DASHBOARD.CASH_IN.HOME,
    });
  },
});
