import { useQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import { DataTable, type ColumnDef } from '@/components/data-table';
import {
  TDataBatchStatus,
  TEntryProcessorTypes,
  type TDataBatch,
} from '@/interfaces/data-batch';
import { DataBatchFilters } from './data-batch-filters';
import { enumToOptions } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Link, useSearch } from '@tanstack/react-router';
import { TableActionCol } from '@/components/table-action-col';
import { useDataBatchAction } from '../-hooks/use-data-batch-action';
import { ROUTES } from '@/router';

export const DataBatchTable = () => {
  const { dataBatch } = useServices();

  const searchQueries = useSearch({
    strict: false,
    structuralSharing: true,
  });

  const { data, isPending, error } = useQuery(
    dataBatch.freightDocumentQueryOptions(searchQueries)
  );

  return (
    <DataTable
      header={DataBatchFilters}
      data={data}
      columns={columns}
      error={error?.message}
      isPending={isPending}
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
    accessorKey: 'creationDate',
    header: 'Created At',
    cell: ({ getValue }) => <CellCreatedAt value={getValue<string>()} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <CellStatus value={getValue<number>()} />,
  },
  {
    id: 'action',
    cell: ({ row }) => <CellAction row={row.original} />,
  },
];

const CellId = ({ value }: { value: string }) => {
  return (
    <Link
      to={ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.BATCH.VIEW}
      params={{ batchId: value }}
    >
      {value}
    </Link>
  );
};

const CellCreatedAt = ({ value }: { value: string }) => {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const entryProcessorOptions = enumToOptions(TEntryProcessorTypes);

const CellEntryProcessorType = ({ value }: { value: number }) => {
  return (
    entryProcessorOptions.find(
      ({ value: optionValue }) => optionValue === value
    )?.label ?? ''
  );
};

const statusOptions = enumToOptions(TDataBatchStatus);
const statusColorMap = {
  [TDataBatchStatus.Pending]: 'warning',
  [TDataBatchStatus.Processing]: 'info',
  [TDataBatchStatus.Completed]: 'success',
  [TDataBatchStatus.Canceled]: 'destructive',
} as const;
const CellStatus = ({ value }: { value: keyof typeof statusColorMap }) => {
  return (
    <Badge dot variant='ghost' color={statusColorMap[value]}>
      {statusOptions.find(({ value: optionValue }) => optionValue === value)
        ?.label ?? ''}
    </Badge>
  );
};

const CellAction = ({ row }: { row: TDataBatch }) => {
  const { onDownload, onView } = useDataBatchAction(row);
  return (
    <TableActionCol>
      <TableActionCol.Copy textToCopy={row.id} />
      <TableActionCol.View onClick={onView} />
      <TableActionCol.Download onClick={onDownload} />
    </TableActionCol>
  );
};
