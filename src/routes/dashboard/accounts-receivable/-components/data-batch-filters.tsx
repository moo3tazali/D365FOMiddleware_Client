import { useMemo, useRef, useState } from 'react';

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
import {
  TEntryProcessorTypes,
  type TDataBatchFilter,
} from '@/interfaces/data-batch';
import { enumToOptions } from '@/lib/utils';

export const DataBatchFilters = () => {
  return (
    <div className='flex items-center gap-2.5 max-w-2xl'>
      <span className='shrink-0 break-keep'>Filter by</span>
      <EntryProcessorTypeFilter />
      <TargetBatchNumberFilter />
    </div>
  );
};

const TargetBatchNumberFilter = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [{ batchNumber }, set, remove] =
    useFilterSearch<TDataBatchFilter>(['batchNumber']);

  const defaultValue = batchNumber
    ? String(batchNumber)
    : '';

  useInputDebounce(inputRef, (value) => {
    if (value) {
      set('batchNumber', +value);
    } else {
      remove('batchNumber');
    }
  });

  return (
    <Input
      ref={inputRef}
      defaultValue={defaultValue}
      placeholder='Enter batch number...'
      type='number'
      name='batchNumber'
    />
  );
};

const entryProcessorOptions = enumToOptions(
  TEntryProcessorTypes
);

const EntryProcessorTypeFilter = () => {
  const [{ entryProcessorType }, set, remove] =
    useFilterSearch<TDataBatchFilter>([
      'entryProcessorType',
    ]);

  const [value, setValue] = useState<string>(
    entryProcessorType ? String(entryProcessorType) : ''
  );

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
      onValueChange={(value) => {
        setValue(value);
        set('entryProcessorType', +value);
      }}
      value={value}
      disabled={false}
      name='entryProcessorType'
    >
      <SelectTrigger
        value={value}
        clearable
        onClear={() => {
          setValue('');
          remove('entryProcessorType');
        }}
        className='w-full'
      >
        <SelectValue placeholder='Select module...' />
      </SelectTrigger>

      <SelectContent>{SelectItems}</SelectContent>
    </Select>
  );
};
