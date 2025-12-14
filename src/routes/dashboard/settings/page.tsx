import { createFileRoute } from '@tanstack/react-router';
import { SettingsHeader } from './-components/settings-header';
import { ErrorFallback, LoadingFallback } from '@/components/fallback';
import { RefreshMasterData } from './-components/refresh-master-data';
import { SettingsForm } from './-components/settings-form';

export const Route = createFileRoute('/dashboard/settings/')({
  component: DashboardSettingsPage,
  loader: ({ context }) => {
    const { services, queryClient } = context;
    queryClient.ensureQueryData(services.appSetting.listQueryOptions());
    queryClient.ensureQueryData(services.masterData.getSyncListQueryOptions());
  },
  pendingComponent: LoadingFallback,
  errorComponent: ErrorFallback,
});

function DashboardSettingsPage() {
  return (
    <div className='h-full space-y-10'>
      <SettingsHeader />
      <RefreshMasterData />
      <hr />
      <SettingsForm />
    </div>
  );
}
