import { Button } from '@/components/ui/button';
import type { OperationalLog } from '@/interfaces/observability';

interface OperationalEventsSectionProps {
  logsList?: OperationalLog[];
  isLoading: boolean;
  search: string;
  batchId: string;
  level: string;
  onSearchChange: (value: string) => void;
  onBatchIdChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onRefresh: () => void;
}

export function OperationalEventsSection({
  logsList,
  isLoading,
  search,
  batchId,
  level,
  onSearchChange,
  onBatchIdChange,
  onLevelChange,
  onRefresh,
}: OperationalEventsSectionProps) {
  return (
    <section className='overflow-hidden rounded-lg border'>
      <div className='space-y-3 border-b p-4'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='font-semibold'>Operational events</h2>
          <Button variant='outline' size='sm' onClick={onRefresh}>
            Refresh
          </Button>
        </div>
        <div className='grid gap-2 md:grid-cols-3'>
          <input
            className='rounded-md border bg-background px-3 py-2 text-sm'
            placeholder='Search messages'
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <input
            className='rounded-md border bg-background px-3 py-2 text-sm'
            placeholder='Batch ID'
            value={batchId}
            onChange={(event) => onBatchIdChange(event.target.value)}
          />
          <select
            className='rounded-md border bg-background px-3 py-2 text-sm'
            value={level}
            onChange={(event) => onLevelChange(event.target.value)}
          >
            <option value=''>All levels</option>
            <option value='info'>Info</option>
            <option value='warn'>Warning</option>
            <option value='error'>Error</option>
          </select>
        </div>
      </div>
      <div className='divide-y'>
        {logsList?.map((log) => (
          <details key={log.eventId} className='p-4'>
            <summary className='grid cursor-pointer gap-1 md:grid-cols-[11rem_5rem_14rem_1fr]'>
              <time className='text-xs text-muted-foreground'>
                {new Date(log.timestamp).toLocaleString()}
              </time>
              <span className={levelClass(log.level)}>{log.level}</span>
              <span className='truncate text-xs'>{log.eventType}</span>
              <span className='text-sm'>{log.message}</span>
            </summary>
            <pre className='mt-3 max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs'>
              {JSON.stringify(log, null, 2)}
            </pre>
          </details>
        ))}
        {!isLoading && logsList?.length === 0 && (
          <p className='p-8 text-center text-sm text-muted-foreground'>
            No events match these filters.
          </p>
        )}
      </div>
    </section>
  );
}

function levelClass(level: string) {
  if (level === 'error') return 'text-xs font-medium text-red-600';
  if (level === 'warn') return 'text-xs font-medium text-amber-600';
  return 'text-xs font-medium text-blue-600';
}
