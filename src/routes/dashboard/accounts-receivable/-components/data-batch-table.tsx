import { useQuery } from '@tanstack/react-query';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useServices } from '@/hooks/use-services';
import {
  DataTable,
  type ColumnDef,
} from '@/components/data-table';
import {
  TEntryProcessorTypes,
  type IDataBatchQuery,
  type TDataBatch,
} from '@/interfaces/data-batch';
import { useParsedSearch } from '@/hooks/use-parsed-search';
import { Input } from '@/components/ui/input';
import { useInputDebounce } from '@/hooks/use-input-debounce';
import { useFilterSearch } from '@/hooks/use-filter-search';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const DataBatchTable = () => {
  const { dataBatch } = useServices();

  const searchQueries = useParsedSearch<IDataBatchQuery>();

  const { data, isPending, error } = useQuery(
    dataBatch.freightDocumentQueryOptions(searchQueries)
  );

  return (
    <DataTable
      header={Filters}
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
    accessorKey: 'totalUploadedCount',
    header: 'Total Uploaded',
  },
  {
    accessorKey: 'totalFormattedCount',
    header: 'Total Formatted',
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
    accessorKey: 'status',
    header: 'Status',
  },
];

const Filters = () => {
  return (
    <div className='flex items-center justify-between gap-2.5'>
      <TargetBatchNumberFilter />
      <EntryProcessorTypeFilter />
    </div>
  );
};

const TargetBatchNumberFilter = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const value = useInputDebounce(inputRef);
  const { addFilter, removeFilter } = useFilterSearch();

  useEffect(() => {
    if (value) {
      addFilter('batchNumber', +value);
    } else {
      removeFilter('batchNumber');
    }
  }, [value, addFilter, removeFilter]);

  return (
    <Input
      ref={inputRef}
      placeholder='Filter by target batch number...'
      className='max-w-sm'
      type='number'
    />
  );
};

const entryProcessorOptions = Object.entries(
  TEntryProcessorTypes
)
  .filter(([, value]) => typeof value === 'number')
  .map(([key, value]) => ({
    label: key.replace(/([a-z])([A-Z])/g, '$1 $2'), // insert space before capital
    value: value as number,
  }));

const EntryProcessorTypeFilter = () => {
  const [value, setValue] = useState<string>('');

  const SelectItems = useMemo(
    () =>
      entryProcessorOptions.map(({ label, value }) => (
        <SelectItem value={String(value)}>
          {label}
        </SelectItem>
      )),
    []
  );

  return (
    <Select
      onValueChange={setValue}
      defaultValue={value}
      disabled={false}
      name='entryProcessorType'
    >
      <SelectTrigger className='w-full max-w-sm'>
        <SelectValue placeholder='Filter by module...' />
      </SelectTrigger>

      <SelectContent>{SelectItems}</SelectContent>
    </Select>
  );
};
