import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/settings/')({
  component: DashboardSettingsPage,
});

function DashboardSettingsPage() {
  return <div>Hello "/dashboard/settings/"!</div>;
}
