import { useQuery } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';

import { useServices } from '@/hooks/use-services';
import { DataTable, type ColumnDef } from '@/components/data-table';
import type { TDataBatchError } from '@/interfaces/data-batch-error';
import { Badge } from '@/components/ui/badge';

export const BatchErrorTable = () => {
  const { dataBatchError } = useServices();

  const { batchId } = useParams({
    from: '/dashboard/ledger/batch/$batchId/errors/',
  });

  const search = useSearch({
    strict: false,
    structuralSharing: true,
  });

  const { data, isPending, error } = useQuery(
    dataBatchError.errorListQueryOptions({ ...search, batchId })
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      error={error?.message}
      isPending={isPending}
    />
  );
};

const columns: ColumnDef<TDataBatchError>[] = [
  {
    accessorKey: 'sourceRecordIds',
    header: 'Source Record IDs',
    cell: ({ getValue }) =>
      (getValue() as string[]).map((id, i) => (
        <Badge key={id + i} color='primary' className='mr-2'>
          {id}
        </Badge>
      )),
  },
  {
    accessorKey: 'errorMessages',
    header: 'Error Messages',
    cell: ({ getValue }) =>
      (getValue() as string[]).map((error, i) => (
        <div key={i} className='mb-2 last:mb-0'>
          {error}
        </div>
      )),
  },
];
