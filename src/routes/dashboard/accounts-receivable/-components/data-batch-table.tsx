import { useQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import {
  DataTable,
  type ColumnDef,
} from '@/components/data-table';
import type { TDataBatch } from '@/interfaces/data-batch';

export const DataBatchTable = () => {
  const { dataBatch } = useServices();

  const { data, isPending, error } = useQuery(
    dataBatch.freightDocumentQueryOptions()
  );

  return (
    <DataTable
      data={data?.items || []}
      columns={columns}
      error={error?.message}
      isPending={isPending}
    />
  );
};

const columns: ColumnDef<TDataBatch>[] = [
  {
    accessorKey: 'description',
    header: 'Title',
  },
  {
    accessorKey: 'creationDate',
    header: 'Created At',
    cell: ({ row }) => {
      const value = row.getValue('creationDate') as string;
      return new Date(value).toLocaleString();
    },
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
    accessorKey: 'totalCount',
    header: 'Total Count',
  },
];
