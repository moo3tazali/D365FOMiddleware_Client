import { TableActionCol } from '@/components/table-action-col';
import { useBatchReprocess } from '@/hooks/use-batch-reprocess';
import type { TDataBatch } from '@/interfaces/data-batch';

interface ReprocessBatchMenuItemProps {
  batch: TDataBatch;
}

export function ReprocessBatchMenuItem({ batch }: ReprocessBatchMenuItemProps) {
  const { canReprocess, disabledReason, isPending, reprocess } =
    useBatchReprocess(batch);
  const isDisabled = !canReprocess || isPending;

  return (
    <TableActionCol.Reprocess
      disabled={isDisabled}
      title={disabledReason}
      onClick={() => reprocess(undefined)}
    >
      {isPending ? 'Queuing Reprocess...' : 'Reprocess Batch'}
    </TableActionCol.Reprocess>
  );
}
