import { ROUTES } from '@/router';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/ledger/batch/')({
  component: undefined,
  beforeLoad: () => {
    throw redirect({
      to: ROUTES.DASHBOARD.LEDGER.HOME,
    });
  },
});
