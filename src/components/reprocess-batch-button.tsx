import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

import { Button } from '@/components/ui/button';
import { useBatchReprocess } from '@/hooks/use-batch-reprocess';
import type { TDataBatch } from '@/interfaces/data-batch';

interface ReprocessBatchButtonProps {
  batch?: TDataBatch;
}

export function ReprocessBatchButton({ batch }: ReprocessBatchButtonProps) {
  const { canReprocess, isPending, reprocess } = useBatchReprocess(batch);

  return (
    <Button
      type='button'
      variant='outline'
      disabled={!batch || !canReprocess || isPending}
      title={
        canReprocess
          ? 'Queue batch reprocessing'
          : 'Only the batch owner or an administrator can reprocess this batch.'
      }
      onClick={() => reprocess(undefined)}
    >
      <RefreshCw className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'Queuing...' : 'Reprocess Batch'}
    </Button>
  );
}
