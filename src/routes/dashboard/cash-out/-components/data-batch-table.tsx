import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import { DataTable, type ColumnDef } from '@/components/data-table';
import { TDataBatchStatus, type TDataBatch } from '@/interfaces/data-batch';
import { DataBatchFilters, DataBatchQuerySchema } from './data-batch-filters';
import { enumToOptions } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { TableActionCol } from '@/components/table-action-col';
import { useDataBatchAction } from '../-hooks/use-data-batch-action';
import { ROUTES } from '@/router';
import { Button } from '@/components/ui/button';
import { ENTRY_PROCESSOR_OPTIONS } from '@/constants/data-batch';
import { useSearchQuery } from '@/hooks/use-search-query';
import { ClampText } from '@/components/ui/clamp-text';
import { ReprocessBatchMenuItem } from '@/components/reprocess-batch-menu-item';
import { PostingPauseMenuItem } from '@/components/posting-pause-menu-item';
import {
  BatchCreatedBy,
  formatBatchDate,
  useRoleAwareBatchColumns,
} from '@/components/batch/batch-audit';

export const DataBatchTable = () => {
  const { dataBatch } = useServices();

  const [searchQueries] = useSearchQuery(DataBatchQuerySchema, {
    withPagination: true,
  });

  const { data, isPending, error, isPlaceholderData } = useQuery(
    dataBatch.batchQueryOptions('cashOut', searchQueries),
  );

  const queryClient = useQueryClient();
  const visibleColumns = useRoleAwareBatchColumns(columns);

  return (
    <DataTable
      header={DataBatchFilters}
      data={data}
      columns={visibleColumns}
      error={error?.message}
      isPending={isPending}
      isPlaceholderData={isPlaceholderData}
      onNextPageHover={(nextPage) => {
        queryClient.prefetchQuery(
          dataBatch.batchQueryOptions('cashOut', {
            ...searchQueries,
            ...nextPage,
          }),
        );
      }}
    />
  );
};

const columns: ColumnDef<TDataBatch>[] = [
  {
    accessorKey: 'id',
    header: 'Batch Number',
    cell: ({ getValue }) => <CellId value={getValue<string>()} />,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ getValue }) => <CellDescription value={getValue<string>()} />,
  },
  {
    accessorKey: 'entryProcessorType',
    header: 'Module',
    cell: ({ getValue }) => (
      <CellEntryProcessorType value={getValue<number>()} />
    ),
  },
  {
    accessorKey: 'totalUploadedCount',
    header: 'Uploaded',
  },
  {
    id: 'admin-formatted',
    accessorKey: 'totalFormattedCount',
    header: 'Formatted',
  },
  {
    accessorKey: 'successCount',
    header: 'Success',
  },
  {
    accessorKey: 'errorCount',
    header: 'Error',
  },
  {
    accessorKey: 'createdByName',
    header: 'Created By',
    cell: ({ row }) => <BatchCreatedBy batch={row.original} />,
  },
  {
    accessorKey: 'creationDate',
    header: 'Created At',
    cell: ({ getValue }) => formatBatchDate(getValue<string>()),
  },
  {
    id: 'admin-reprocess-count',
    accessorKey: 'reprocessCount',
    header: 'Reprocessed',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <CellStatus batch={row.original} />,
  },
  {
    id: 'action',
    cell: ({ row }) => <CellAction row={row.original} />,
  },
];

const CellId = ({ value }: { value: string }) => {
  return (
    <Button
      asChild
      variant='link'
      className='p-0! items-start leading-tight'
      style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
    >
      <Link
        to={ROUTES.DASHBOARD.CASH_OUT.BATCH.VIEW}
        params={{ batchId: value }}
      >
        {value}
      </Link>
    </Button>
  );
};

const CellDescription = ({ value }: { value: string }) => {
  return <ClampText>{value}</ClampText>;
};

const entryProcessorOptions = ENTRY_PROCESSOR_OPTIONS.CASH_OUT;

const CellEntryProcessorType = ({ value }: { value: number }) => {
  return (
    entryProcessorOptions.find(
      ({ value: optionValue }) => optionValue === value,
    )?.label ?? ''
  );
};

const statusOptions = enumToOptions(TDataBatchStatus);
const statusColorMap = {
  [TDataBatchStatus.PendingPosting]: 'warning',
  [TDataBatchStatus.Posting]: 'info',
  [TDataBatchStatus.Posted]: 'success',
  [TDataBatchStatus.Canceled]: 'destructive',
  [TDataBatchStatus.Revalidating]: 'info',
} as const;
const CellStatus = ({ batch }: { batch: TDataBatch }) => {
  const status = batch.status as keyof typeof statusColorMap;
  return (
    <div className='flex flex-col items-start gap-0.5'>
      <Badge dot variant='ghost' color={statusColorMap[status]}>
        {statusOptions.find(({ value: optionValue }) => optionValue === status)
          ?.label ?? ''}
      </Badge>
      {batch.postingPaused && (
        <Badge dot variant='ghost' color='warning' size='small'>
          Posting paused
        </Badge>
      )}
    </div>
  );
};

const CellAction = ({ row }: { row: TDataBatch }) => {
  const {
    onDownload,
    onView,
    onDownloadError,
    onDownloadSourceFile,
    onDelete,
    canDelete,
  } = useDataBatchAction(row);
  return (
    <TableActionCol>
      <TableActionCol.Copy textToCopy={row.id}>
        Copy Batch Number
      </TableActionCol.Copy>
      <TableActionCol.View onClick={onView} />
      <PostingPauseMenuItem batch={row} />
      <ReprocessBatchMenuItem batch={row} />
      <TableActionCol.Download variant='primary' onClick={onDownload}>
        Download Batch
      </TableActionCol.Download>
      <TableActionCol.Download variant='destructive' onClick={onDownloadError}>
        Download Errors
      </TableActionCol.Download>
      <TableActionCol.Download onClick={onDownloadSourceFile}>
        Download source file
      </TableActionCol.Download>
      <TableActionCol.Delete
        variant='destructive'
        onClick={onDelete}
        disabled={!canDelete}
      >
        Delete Batch
      </TableActionCol.Delete>
    </TableActionCol>
  );
};
