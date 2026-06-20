import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import RefreshCwIcon from 'lucide-react/dist/esm/icons/refresh-cw';
import ActivityIcon from 'lucide-react/dist/esm/icons/activity';
import ServerIcon from 'lucide-react/dist/esm/icons/server';
import CheckCircleIcon from 'lucide-react/dist/esm/icons/check-circle';
import AlertTriangleIcon from 'lucide-react/dist/esm/icons/alert-triangle';
import ClockIcon from 'lucide-react/dist/esm/icons/clock';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useServices } from '@/hooks/use-services';
import { ROUTES } from '@/router';
import { DurableJobsTable } from './-components/durable-jobs-table';

export const Route = createFileRoute('/dashboard/queues/')({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== 'ADMIN') {
      throw redirect({ to: ROUTES.DASHBOARD.HOME });
    }
  },
  component: QueuesPage,
});

function QueuesPage() {
  const { observability } = useServices();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    data: queuesData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    ...observability.queuesQueryOptions(),
    refetchInterval: autoRefresh ? 5_000 : false,
  });

  const queuesList = queuesData?.queues ?? [];

  // Summary Metrics calculations
  const totalQueues = queuesList.length;
  const totalWaiting = queuesList.reduce((sum, q) => sum + (q.waiting || 0), 0);
  const totalActive = queuesList.reduce((sum, q) => sum + (q.active || 0), 0);
  const totalFailed = queuesList.reduce((sum, q) => sum + (q.failed || 0), 0);
  const systemHealth = totalFailed > 0 ? 'Warning' : 'Healthy';

  return (
    <div className='space-y-6'>
      <header className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Background Queues
          </h1>
          <p className='text-sm text-muted-foreground'>
            Monitor and manage background queues, job executions, and
            system-wide task engines.
          </p>
        </div>
        <div className='flex items-center gap-3 self-start sm:self-auto'>
          <div className='flex items-center gap-2 mr-2'>
            <input
              type='checkbox'
              id='queues-auto-refresh'
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className='rounded border-gray-300 text-primary focus:ring-primary size-4'
            />
            <label
              htmlFor='queues-auto-refresh'
              className='text-xs text-muted-foreground select-none cursor-pointer'
            >
              Auto-refresh (5s)
            </label>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => void refetch()}
            disabled={isLoading || isRefetching}
            className='h-9 gap-1.5 text-xs'
          >
            <RefreshCwIcon
              className={cn(
                'size-3.5',
                (isLoading || isRefetching) && 'animate-spin',
              )}
            />
            Refresh
          </Button>
        </div>
      </header>

      {/* Summary Overview Cards */}
      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {overviewCard(
          'Health Status',
          systemHealth,
          systemHealth === 'Healthy'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
          systemHealth === 'Healthy' ? (
            <CheckCircleIcon className='size-5' />
          ) : (
            <AlertTriangleIcon className='size-5' />
          ),
          <Badge
            color={systemHealth === 'Healthy' ? 'success' : 'warning'}
            size='small'
            className='px-1.5 py-0 text-[10px] font-medium'
          >
            {systemHealth === 'Healthy' ? 'Healthy' : 'Warning'}
          </Badge>,
        )}
        {overviewCard(
          'Total Queues',
          `${totalQueues} Engines`,
          'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
          <ServerIcon className='size-5' />,
        )}
        {overviewCard(
          'Active Tasks',
          `${totalActive} Jobs`,
          'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
          <ActivityIcon className={totalActive > 0 ? 'animate-pulse' : ''} />,
        )}
        {overviewCard(
          'Waiting Tasks',
          `${totalWaiting} Jobs`,
          'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400',
          <ClockIcon className='size-5' />,
        )}
        {overviewCard(
          'Failed Tasks',
          `${totalFailed} Jobs`,
          'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
          <AlertTriangleIcon className='size-5' />,
          totalFailed > 0 && (
            <Badge
              color='destructive'
              size='small'
              className='px-1.5 py-0 text-[10px] font-medium'
            >
              Action Required
            </Badge>
          ),
        )}
      </section>

      {/* Queue Cards Grid */}
      <section className='space-y-4'>
        <h2 className='text-lg font-semibold tracking-tight'>
          Active Processing Queues
        </h2>
        {isLoading ? (
          <div className='flex items-center justify-center py-20 text-muted-foreground text-sm gap-2'>
            <RefreshCwIcon className='size-5 animate-spin text-primary' />
            Loading queues metrics...
          </div>
        ) : queuesList.length === 0 ? (
          <p className='text-center py-10 text-sm text-muted-foreground border rounded-lg bg-card'>
            No active background queues registered.
          </p>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {queuesList.map((queue) => {
              const hasErrors = (queue.failed || 0) > 0;
              const isRunning = (queue.active || 0) > 0;
              return (
                <Card
                  key={queue.queueName}
                  className='overflow-hidden border hover:border-primary/30 transition-all shadow-xs group bg-card hover:shadow-md'
                >
                  <CardContent className='p-5 space-y-4 flex flex-col h-full justify-between'>
                    <div className='space-y-1.5'>
                      <div className='flex items-center justify-between gap-2'>
                        <h3
                          className='font-bold text-sm truncate font-mono text-foreground'
                          title={queue.queueName}
                        >
                          {queue.queueName}
                        </h3>
                        <div className='flex gap-1'>
                          {queue.isPaused && (
                            <Badge
                              color='warning'
                              size='small'
                              className='px-1.5 py-0 text-[9px] font-semibold uppercase rounded-xs'
                            >
                              Paused
                            </Badge>
                          )}
                          <Badge
                            color={
                              hasErrors
                                ? 'destructive'
                                : isRunning
                                  ? 'info'
                                  : 'muted'
                            }
                            size='small'
                            className='px-1.5 py-0 text-[9px] font-semibold uppercase rounded-xs'
                          >
                            {hasErrors
                              ? 'Failed'
                              : isRunning
                                ? 'Running'
                                : 'Idle'}
                          </Badge>
                        </div>
                      </div>
                      <p className='text-[10px] text-muted-foreground font-mono'>
                        BullMQ Engine Status
                      </p>
                    </div>

                    <div className='grid grid-cols-3 gap-2 border rounded-md p-3.5 bg-muted/10 text-center'>
                      <div>
                        <div className='text-base font-bold font-mono text-foreground'>
                          {queue.waiting ?? 0}
                        </div>
                        <div className='text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5'>
                          Waiting
                        </div>
                      </div>
                      <div>
                        <div
                          className={cn(
                            'text-base font-bold font-mono',
                            isRunning
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-foreground',
                          )}
                        >
                          {queue.active ?? 0}
                        </div>
                        <div className='text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5'>
                          Active
                        </div>
                      </div>
                      <div>
                        <div
                          className={cn(
                            'text-base font-bold font-mono',
                            hasErrors
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-foreground',
                          )}
                        >
                          {queue.failed ?? 0}
                        </div>
                        <div className='text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5'>
                          Failed
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between gap-4 text-xs pt-1.5 border-t'>
                      <div className='flex items-center gap-1.5 text-muted-foreground'>
                        <span>
                          Delayed: <strong>{queue.delayed ?? 0}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Completed: <strong>{queue.completed ?? 0}</strong>
                        </span>
                      </div>
                      <Link
                        to={ROUTES.DASHBOARD.QUEUES.VIEW}
                        params={{ queueName: queue.queueName }}
                        className='text-xs font-semibold text-primary hover:underline uppercase tracking-wider'
                      >
                        Inspect →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Durable Jobs Table */}
      <DurableJobsTable jobsList={queuesData?.jobs} />
    </div>
  );
}

// Subcomponent: overview card helper
function overviewCard(
  title: string,
  value: string,
  iconClass: string,
  icon: React.ReactNode,
  extra?: React.ReactNode,
) {
  return (
    <Card className='overflow-hidden border shadow-xs bg-card'>
      <CardContent className='flex items-center gap-3.5 p-4'>
        <div className={cn('rounded-full p-2.5', iconClass)}>{icon}</div>
        <div className='flex-1 min-w-0'>
          <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider'>
            {title}
          </p>
          <div className='flex items-center gap-2 mt-0.5'>
            <h3 className='text-sm font-bold truncate text-foreground'>
              {value}
            </h3>
            {extra}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ');
}
