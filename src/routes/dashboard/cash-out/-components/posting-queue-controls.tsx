import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PauseIcon from 'lucide-react/dist/esm/icons/pause';
import PlayIcon from 'lucide-react/dist/esm/icons/play';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { CashPostingQueueState } from '@/services/api/cash-out';

/**
 * Whether the queue that carries cash batches to D365FO is running, with an
 * admin-only switch. Pausing it stops new batches from being picked up; a batch
 * that is already posting is stopped from its own page instead.
 */
export const PostingQueueControls = () => {
  const { cashOut } = useServices();
  const { invalidate } = useInvalidate();
  const isAdmin = useAuth((state) => state.user?.role === 'ADMIN');

  const { data: queue, isPending } = useQuery(cashOut.postingQueueQueryOptions());

  const mutation = useMutation<CashPostingQueueState, boolean>({
    operationName: 'change the posting queue',
    mutationFn: (paused: boolean) => cashOut.setPostingQueuePaused(paused),
    disableToast: true,
    onSuccess: (state) => {
      invalidate(cashOut.postingQueueQueryKey);
      // Keep Observability's queue cards in sync with this Cash Out switch.
      invalidate(['admin.observability.queues']);
      toast.success(
        state.paused
          ? `Uploads to D365FO are paused. ${state.waiting} batch(es) are waiting in the queue.`
          : 'Uploads to D365FO resumed.',
        { duration: 6000 },
      );
    },
    onError: (error) => {
      toast.error(error.message ?? 'Could not change the posting queue.');
    },
  });

  if (isPending || !queue) return null;
  if (!queue.paused && !isAdmin) return null;

  const queued = queue.waiting + queue.delayed;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
        queue.paused
          ? 'border-amber-500/25 bg-amber-500/10 dark:border-amber-950/50 dark:bg-amber-950/20'
          : 'border-border'
      }`}
    >
      <div className='min-w-0 space-y-1'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>Upload queue</span>
          <Badge dot variant='ghost' color={queue.paused ? 'warning' : 'success'}>
            {queue.paused ? 'Paused' : 'Running'}
          </Badge>
        </div>
        <p className='text-sm text-muted-foreground'>
          {queue.paused
            ? `Nothing is being sent to D365FO. ${queued} batch(es) wait in the queue, and ${queue.active} already running batch(es) finish their current journal.`
            : `${queued} batch(es) waiting, ${queue.active} being posted right now.`}
        </p>
      </div>

      {isAdmin && (
        <Button
          variant={queue.paused ? 'default' : 'destructive'}
          className='shrink-0'
          disabled={mutation.isPending}
          onClick={() => {
            if (queue.paused) {
              mutation.mutate(false);
              return;
            }
            if (
              window.confirm(
                'Pause uploads to D365FO? Batches submitted from now on wait in the queue until it is resumed.',
              )
            ) {
              mutation.mutate(true);
            }
          }}
        >
          {queue.paused ? (
            <>
              <PlayIcon className='size-4 fill-current' />
              Resume uploads
            </>
          ) : (
            <>
              <PauseIcon className='size-4 fill-current' />
              Pause uploads
            </>
          )}
        </Button>
      )}
    </div>
  );
};
