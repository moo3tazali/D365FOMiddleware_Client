import { createFileRoute, redirect } from '@tanstack/react-router';
import ActivityIcon from 'lucide-react/dist/esm/icons/activity';
import DatabaseIcon from 'lucide-react/dist/esm/icons/database';
import ServerIcon from 'lucide-react/dist/esm/icons/server';
import CheckCircleIcon from 'lucide-react/dist/esm/icons/check-circle';
import AlertTriangleIcon from 'lucide-react/dist/esm/icons/alert-triangle';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/router';
import { useObservability } from './-hooks/use-observability';
import { OperationalEventsSection } from './-components/operational-events-section';
import { ProcessingControlsSection } from './-components/processing-controls-section';

export const Route = createFileRoute('/dashboard/observability/')({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== 'ADMIN') {
      throw redirect({ to: ROUTES.DASHBOARD.HOME });
    }
  },
  component: ObservabilityPage,
});

function ObservabilityPage() {
  const obs = useObservability();
  const { queues } = obs;

  // Calculate stats for Application Overview
  const totalFailed = queues?.reduce((sum, q) => sum + (q.failed || 0), 0) ?? 0;
  const totalActive = queues?.reduce((sum, q) => sum + (q.active || 0), 0) ?? 0;
  const totalWaiting =
    queues?.reduce((sum, q) => sum + (q.waiting || 0), 0) ?? 0;

  const systemHealth = totalFailed > 0 ? 'Warning' : 'Healthy';
  const queueEngineStatus = totalActive > 0 ? 'Running' : 'Idle';

  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-2xl font-bold tracking-tight'>
          Application Observability
        </h1>
        <p className='text-sm text-muted-foreground'>
          Durable operational traces, historical logs explorer, and live queue
          monitoring.
        </p>
      </header>

      {/* Application Overview Section */}
      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='overflow-hidden border shadow-xs'>
          <CardContent className='flex items-center gap-4 p-4'>
            <div
              className={`rounded-full p-2 ${
                systemHealth === 'Healthy'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
              }`}
            >
              {systemHealth === 'Healthy' ? (
                <CheckCircleIcon className='size-5' />
              ) : (
                <AlertTriangleIcon className='size-5' />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                System Health
              </p>
              <div className='flex items-center gap-2 mt-0.5'>
                <h3 className='text-sm font-semibold truncate'>
                  {systemHealth}
                </h3>
                <Badge
                  color={systemHealth === 'Healthy' ? 'success' : 'warning'}
                  size='small'
                  className='px-1.5 py-0 text-[10px] font-medium'
                >
                  {systemHealth === 'Healthy' ? 'Healthy' : 'Issues'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='overflow-hidden border shadow-xs'>
          <CardContent className='flex items-center gap-4 p-4'>
            <div
              className={`rounded-full p-2 ${
                queueEngineStatus === 'Running'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                  : 'bg-gray-50 text-gray-600 dark:bg-zinc-800/30 dark:text-zinc-400'
              }`}
            >
              <ActivityIcon
                className={`size-5 ${queueEngineStatus === 'Running' ? 'animate-pulse' : ''}`}
              />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                Queue Status
              </p>
              <div className='flex items-center gap-2 mt-0.5'>
                <h3 className='text-sm font-semibold truncate'>
                  {queueEngineStatus}
                </h3>
                <Badge
                  color={queueEngineStatus === 'Running' ? 'info' : 'muted'}
                  size='small'
                  className='px-1.5 py-0 text-[10px] font-medium'
                >
                  {queueEngineStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='overflow-hidden border shadow-xs'>
          <CardContent className='flex items-center gap-4 p-4'>
            <div className='rounded-full p-2 bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'>
              <ServerIcon className='size-5' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                Active / Waiting
              </p>
              <h3 className='text-sm font-semibold mt-0.5'>
                {totalActive} active / {totalWaiting} waiting
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className='overflow-hidden border shadow-xs'>
          <CardContent className='flex items-center gap-4 p-4'>
            <div className='rounded-full p-2 bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400'>
              <DatabaseIcon className='size-5' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                DB Connection
              </p>
              <div className='flex items-center gap-2 mt-0.5'>
                <h3 className='text-sm font-semibold truncate'>MongoDB</h3>
                <Badge
                  color='success'
                  size='small'
                  className='px-1.5 py-0 text-[10px] font-medium'
                >
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Queue and batch posting switches */}
      <ProcessingControlsSection />

      {/* Operational Logs Explorer Section */}
      <OperationalEventsSection obs={obs} />
    </div>
  );
}
