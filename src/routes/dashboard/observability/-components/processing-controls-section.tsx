import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link2Icon from 'lucide-react/dist/esm/icons/external-link';
import PauseIcon from 'lucide-react/dist/esm/icons/pause';
import PlayIcon from 'lucide-react/dist/esm/icons/play';
import TrashIcon from 'lucide-react/dist/esm/icons/trash-2';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useServices } from '@/hooks/use-services';
import type { InFlightPosting, QueueStats } from '@/interfaces/observability';
import { ROUTES } from '@/router';
import { Link } from '@tanstack/react-router';

const QUEUE_KEYS = {
  queues: ['admin.observability.queues'],
  postings: ['admin.observability.postings'],
};

/**
 * Operational switches: pause a whole queue so nothing new is uploaded, hold a
 * single batch back, or delete a batch and discard its waiting/paused upload
 * work. Pausing a queue stops it from handing out new jobs; pausing a batch
 * stops its worker after the journal it is currently writing.
 */
export const ProcessingControlsSection = () => {
  const { observability } = useServices();
  const queryClient = useQueryClient();

  const { data: queueData, isLoading: isLoadingQueues } = useQuery(
    observability.queuesQueryOptions(),
  );
  const { data: postings, isLoading: isLoadingPostings } = useQuery(
    observability.inFlightPostingsQueryOptions(),
  );

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: QUEUE_KEYS.queues });
    void queryClient.invalidateQueries({ queryKey: QUEUE_KEYS.postings });
    // Cash Out reads the same queue through its own key.
    void queryClient.invalidateQueries({ queryKey: ['cash-posting-queue'] });
    void queryClient.invalidateQueries({ queryKey: ['data-batch'] });
  };

  const queueMutation = useMutation({
    mutationFn: ({ queueName, pause }: { queueName: string; pause: boolean }) =>
      pause
        ? observability.pauseQueue(queueName)
        : observability.resumeQueue(queueName),
    onSuccess: (_result, { queueName, pause }) => {
      toast.success(
        pause
          ? `Queue ${queueName} paused. Queued jobs wait until it is resumed.`
          : `Queue ${queueName} resumed.`,
      );
      refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change the queue');
    },
  });

  return (
    <section className='space-y-3'>
      <div>
        <h2 className='text-lg font-semibold tracking-tight'>
          Processing controls
        </h2>
        <p className='text-sm text-muted-foreground'>
          Pause a queue to stop new uploads to D365FO, pause a single batch to
          hold only that batch back, or delete a batch to discard its upload
          work even while it is posting. The journal being written may still
          finish in D365FO; further journals stop.
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        {isLoadingQueues && !queueData
          ? Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className='border shadow-xs'>
                <CardContent className='h-24 animate-pulse p-4' />
              </Card>
            ))
          : (queueData?.queues ?? []).map((queue) => (
              <QueueCard
                key={queue.queueName}
                queue={queue}
                isPending={queueMutation.isPending}
                onToggle={(pause) =>
                  queueMutation.mutate({ queueName: queue.queueName, pause })
                }
              />
            ))}
      </div>

      <PostingsTable
        postings={postings ?? []}
        isLoading={isLoadingPostings && !postings}
        onChanged={refresh}
      />
    </section>
  );
};

const QueueCard = ({
  queue,
  isPending,
  onToggle,
}: {
  queue: QueueStats;
  isPending: boolean;
  onToggle: (pause: boolean) => void;
}) => (
  <Card
    className={`border shadow-xs ${
      queue.isPaused
        ? 'border-amber-500/40 bg-amber-500/5 dark:border-amber-950/60'
        : ''
    }`}
  >
    <CardContent className='space-y-3 p-4'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>{queue.queueName}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {queue.waiting} waiting · {queue.active} active · {queue.failed}{' '}
            failed
          </p>
        </div>
        <Badge
          color={queue.isPaused ? 'warning' : 'success'}
          size='small'
          dot
          variant='ghost'
        >
          {queue.isPaused ? 'Paused' : 'Running'}
        </Badge>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          size='sm'
          variant={queue.isPaused ? 'default' : 'destructive'}
          disabled={isPending}
          onClick={() => {
            if (queue.isPaused) {
              onToggle(false);
              return;
            }
            if (
              window.confirm(
                `Pause queue ${queue.queueName}? No new jobs are processed until it is resumed.`,
              )
            ) {
              onToggle(true);
            }
          }}
        >
          {queue.isPaused ? (
            <>
              <PlayIcon className='size-3.5 fill-current' />
              Resume
            </>
          ) : (
            <>
              <PauseIcon className='size-3.5 fill-current' />
              Pause
            </>
          )}
        </Button>
        <Button asChild size='sm' variant='outline'>
          <Link
            to={ROUTES.DASHBOARD.QUEUES.VIEW}
            params={{ queueName: queue.queueName }}
          >
            <Link2Icon className='size-3.5' />
            Jobs
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const PostingsTable = ({
  postings,
  isLoading,
  onChanged,
}: {
  postings: InFlightPosting[];
  isLoading: boolean;
  onChanged: () => void;
}) => {
  const { dataBatch } = useServices();
  const queryClient = useQueryClient();

  const batchMutation = useMutation({
    mutationFn: ({ batchId, pause }: { batchId: string; pause: boolean }) =>
      pause
        ? dataBatch.pausePosting(batchId)
        : dataBatch.resumePosting(batchId),
    onSuccess: (state) => {
      toast.success(state.message, { duration: 6000 });
      onChanged();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change the batch');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (batchId: string) => dataBatch.deleteBatch({ batchId }),
    onSuccess: (_result, batchId) => {
      toast.success(`Batch ${batchId} deleted.`, { duration: 5000 });
      onChanged();
      void queryClient.invalidateQueries({ queryKey: ['data-batch'] });
      void queryClient.invalidateQueries({ queryKey: ['cash-posting-queue'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete the batch');
    },
  });

  const busy = batchMutation.isPending || deleteMutation.isPending;

  return (
    <Card className='border shadow-xs'>
      <CardContent className='p-0'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <p className='text-sm font-semibold'>Batches being posted</p>
          <span className='text-xs text-muted-foreground'>
            {postings.length} in flight
          </span>
        </div>

        {isLoading ? (
          <div className='h-16 animate-pulse' />
        ) : postings.length === 0 ? (
          <p className='px-4 py-6 text-sm text-muted-foreground'>
            No batch is queued or being posted right now.
          </p>
        ) : (
          <ul className='divide-y'>
            {postings.map((posting) => (
              <li
                key={posting.jobId}
                className='flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='min-w-0 space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='font-mono text-xs'>{posting.batchId}</span>
                    <Badge size='small' color='muted'>
                      {posting.sourceModule}
                    </Badge>
                    <Badge
                      size='small'
                      dot
                      variant='ghost'
                      color={postingColor(posting)}
                    >
                      {postingLabel(posting)}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {posting.completedGroups}/{posting.totalGroups} journals ·{' '}
                    {posting.queueName}
                  </p>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  <Button
                    size='sm'
                    variant={posting.paused ? 'default' : 'destructive'}
                    disabled={busy}
                    onClick={() => {
                      if (posting.paused) {
                        batchMutation.mutate({
                          batchId: posting.batchId,
                          pause: false,
                        });
                        return;
                      }
                      if (
                        window.confirm(
                          `Pause posting batch ${posting.batchId}? The journal being written right now is finished first, then the remaining journals wait until you resume.`,
                        )
                      ) {
                        batchMutation.mutate({
                          batchId: posting.batchId,
                          pause: true,
                        });
                      }
                    }}
                  >
                    {posting.paused ? (
                      <>
                        <PlayIcon className='size-3.5 fill-current' />
                        Resume batch
                      </>
                    ) : (
                      <>
                        <PauseIcon className='size-3.5 fill-current' />
                        Pause batch
                      </>
                    )}
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete batch ${posting.batchId} even if it is posting? Queue work is discarded and further journals stop. The journal being written right now may still finish in D365FO. Journals already created there are not removed. This cannot be undone.`,
                        )
                      ) {
                        deleteMutation.mutate(posting.batchId);
                      }
                    }}
                  >
                    <TrashIcon className='size-3.5' />
                    Delete batch
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

function postingLabel(posting: InFlightPosting): string {
  if (posting.stopping) return 'Pausing';
  if (posting.paused) return 'Paused';
  return posting.jobStatus;
}

function postingColor(posting: InFlightPosting) {
  if (posting.paused) return 'warning' as const;
  if (posting.jobStatus === 'active') return 'info' as const;
  if (posting.jobStatus === 'retrying') return 'destructive' as const;
  return 'muted' as const;
}
