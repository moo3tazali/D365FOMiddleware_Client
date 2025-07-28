import { createFileRoute } from '@tanstack/react-router';
import { ModuleCards } from './-components/module-cards';
import { ErrorFallback, LoadingFallback } from '@/components/fallback';

export const Route = createFileRoute('/dashboard/(home)/')({
  component: DashboardHomePage,
  pendingComponent: LoadingFallback,
  errorComponent: ErrorFallback,
});

function DashboardHomePage() {
  return (
    <div className='h-full flex flex-col gap-5'>
      <ModuleCards />
    </div>
  );
}
