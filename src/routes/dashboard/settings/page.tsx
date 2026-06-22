import { createFileRoute } from '@tanstack/react-router';
import { SettingsHeader } from './-components/settings-header';
import { ErrorFallback } from '@/components/fallback/error-fallback';
import { LoadingFallback } from '@/components/fallback/loading-fallback';
import { RefreshMasterData } from './-components/refresh-master-data';

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
    <div className='h-full space-y-5'>
      <SettingsHeader />
      <RefreshMasterData />
    </div>
  );
}
