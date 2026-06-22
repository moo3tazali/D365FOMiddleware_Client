import { useMemo } from 'react';

import type { ColumnDef } from '@/components/data-table';
import { useAuth } from '@/hooks/use-auth';
import type { TDataBatch } from '@/interfaces/data-batch';

const ADMIN_COLUMN_PREFIX = 'admin-';

export function useRoleAwareBatchColumns(
  columns: ColumnDef<TDataBatch>[],
): ColumnDef<TDataBatch>[] {
  const isAdmin = useAuth((state) => state.user?.role === 'ADMIN');

  return useMemo(
    () =>
      columns.filter(
        (column) =>
          isAdmin ||
          !('id' in column && column.id?.startsWith(ADMIN_COLUMN_PREFIX)),
      ),
    [columns, isAdmin],
  );
}

export function BatchCreatedBy({ batch }: { batch: TDataBatch }) {
  const isAdmin = useAuth((state) => state.user?.role === 'ADMIN');
  const name = batch.createdByName || batch.createdByEmail || 'Unknown';

  return (
    <div className='min-w-0'>
      <div className='truncate font-medium text-foreground' title={name}>
        {name}
      </div>
      {isAdmin && batch.createdByEmail && batch.createdByEmail !== name && (
        <div
          className='truncate text-xs text-muted-foreground'
          title={batch.createdByEmail}
        >
          {batch.createdByEmail}
        </div>
      )}
    </div>
  );
}

export function formatBatchDate(value?: string) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
