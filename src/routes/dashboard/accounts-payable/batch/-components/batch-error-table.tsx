import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

import { useServices } from '@/hooks/use-services';
import { DataTable, type ColumnDef } from '@/components/data-table';
import type { TDataBatchError } from '@/interfaces/data-batch-error';
import { Badge } from '@/components/ui/badge';
import { useParsedPagination } from '@/hooks/use-parsed-pagination';

export const BatchErrorTable = () => {
  const { dataBatchError } = useServices();

  const { batchId } = useParams({
    from: '/dashboard/accounts-payable/batch/$batchId/errors/',
  });

  const { maxCount, skipCount } = useParsedPagination();

  const { data, isPending, error, isPlaceholderData } = useQuery(
    dataBatchError.errorListQueryOptions({ maxCount, skipCount, batchId })
  );

  const queryClient = useQueryClient();

  return (
    <DataTable
      data={data}
      columns={columns}
      error={error?.message}
      isPending={isPending}
      isPlaceholderData={isPlaceholderData}
      onNextPageHover={(nextPage) => {
        queryClient.prefetchQuery(
          dataBatchError.errorListQueryOptions({
            ...nextPage,
            batchId,
          })
        );
      }}
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
