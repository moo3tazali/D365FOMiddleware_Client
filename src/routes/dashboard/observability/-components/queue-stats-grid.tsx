import type { QueueStats } from '@/interfaces/observability';
import { Metric } from './metric';

interface QueueStatsGridProps {
  queuesList?: QueueStats[];
}

export function QueueStatsGrid({ queuesList }: QueueStatsGridProps) {
  if (!queuesList) return null;

  return (
    <section className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
      {queuesList.map((queue) => (
        <article key={queue.queueName} className='rounded-lg border p-4'>
          <h2 className='truncate text-sm font-medium'>{queue.queueName}</h2>
          <div className='mt-3 grid grid-cols-3 gap-2 text-center text-xs'>
            <Metric label='Waiting' metricValue={queue.waiting} />
            <Metric label='Active' metricValue={queue.active} />
            <Metric label='Failed' metricValue={queue.failed} />
          </div>
        </article>
      ))}
    </section>
  );
}
