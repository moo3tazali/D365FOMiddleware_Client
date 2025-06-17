import { useQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import {
  DataTable,
  type ColumnDef,
} from '@/components/data-table';
import {
  TDataBatchStatus,
  TEntryProcessorTypes,
  type TDataBatch,
  type TDataBatchFilter,
} from '@/interfaces/data-batch';
import { useParsedSearch } from '@/hooks/use-parsed-search';
import { DataBatchFilters } from './data-batch-filters';
import { enumToOptions } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const DataBatchTable = () => {
  const { dataBatch } = useServices();

  const searchQueries = useParsedSearch<TDataBatchFilter>();

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
    header: 'Total Uploaded',
  },
  {
    accessorKey: 'totalFormattedCount',
    header: 'Total Formatted',
  },
  {
    accessorKey: 'successCount',
    header: 'Success Count',
  },
  {
    accessorKey: 'errorCount',
    header: 'Error Count',
  },
  {
    accessorKey: 'creationDate',
    header: 'Created At',
    cell: ({ getValue }) => (
      <CellCreatedAt value={getValue<string>()} />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => (
      <CellStatus value={getValue<number>()} />
    ),
  },
];

const CellCreatedAt = ({ value }: { value: string }) => {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const entryProcessorOptions = enumToOptions(
  TEntryProcessorTypes
);

const CellEntryProcessorType = ({
  value,
}: {
  value: number;
}) => {
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
const CellStatus = ({
  value,
}: {
  value: keyof typeof statusColorMap;
}) => {
  return (
    <Badge
      dot
      variant='ghost'
      color={statusColorMap[value]}
    >
      {statusOptions.find(
        ({ value: optionValue }) => optionValue === value
      )?.label ?? ''}
    </Badge>
  );
};
