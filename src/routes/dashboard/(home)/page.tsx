import { createFileRoute } from '@tanstack/react-router';
import { ModuleCards } from './-components/module-cards';

export const Route = createFileRoute('/dashboard/(home)/')({
  component: DashboardHomePage,
});

function DashboardHomePage() {
  return (
    <div className='h-full flex flex-col gap-5'>
      <ModuleCards />
    </div>
  );
}
