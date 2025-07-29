import { Suspense } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { SettingsHeader } from './-components/settings-header';
import { SettingsTable } from './-components/settings-table';
import { ErrorFallback, LoadingFallback } from '@/components/fallback';

export const Route = createFileRoute('/dashboard/settings/')({
  component: DashboardSettingsPage,
  loader: ({ context }) => {
    const { services, queryClient } = context;
    queryClient.ensureQueryData(services.appSetting.queryOptions());
  },
  pendingComponent: LoadingFallback,
  errorComponent: ErrorFallback,
});

function DashboardSettingsPage() {
  return (
    <div className='h-full space-y-10'>
      <SettingsHeader />
      <Suspense fallback={<LoadingFallback />}>
        <SettingsTable />
      </Suspense>
    </div>
  );
}
