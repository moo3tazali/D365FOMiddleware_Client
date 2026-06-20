import { createFileRoute, redirect } from '@tanstack/react-router';

import { ROUTES } from '@/router';
import { useObservability } from './-hooks/use-observability';
import { QueueStatsGrid } from './-components/queue-stats-grid';
import { DurableJobsTable } from './-components/durable-jobs-table';
import { OperationalEventsSection } from './-components/operational-events-section';

export const Route = createFileRoute('/dashboard/observability/')({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== 'ADMIN') {
      throw redirect({ to: ROUTES.DASHBOARD.HOME });
    }
  },
  component: ObservabilityPage,
});

function ObservabilityPage() {
  const {
    search,
    setSearch,
    batchId,
    setBatchId,
    level,
    setLevel,
    logs,
    isLoadingLogs,
    queues,
    jobs,
    refetchLogs,
  } = useObservability();

  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-2xl font-semibold'>Application observability</h1>
        <p className='text-sm text-muted-foreground'>
          Durable operational traces and live queue state. Refreshes every five
          seconds.
        </p>
      </header>

      <QueueStatsGrid queuesList={queues} />

      <DurableJobsTable jobsList={jobs} />

      <OperationalEventsSection
        logsList={logs}
        isLoading={isLoadingLogs}
        search={search}
        batchId={batchId}
        level={level}
        onSearchChange={setSearch}
        onBatchIdChange={setBatchId}
        onLevelChange={setLevel}
        onRefresh={refetchLogs}
      />
    </div>
  );
}
