import { useMemo, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useInputDebounce } from '@/hooks/use-input-debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TEntryProcessorTypes } from '@/interfaces/data-batch';
import { enumToOptions } from '@/lib/utils';
import { useSearchQuery } from '@/hooks/use-search-query';

export const DataBatchFilters = () => {
  return (
    <div className='flex items-center gap-2.5 max-w-2xl'>
      <span className='shrink-0 break-keep'>Filter by</span>
      <div className='grid grid-cols-2 gap-2.5 flex-1'>
        <EntryProcessorTypeFilter />
        <TargetBatchNumberFilter />
      </div>
    </div>
  );
};

const TargetBatchNumberFilter = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [{ batchNumber }, set, remove] = useSearchQuery(['batchNumber']);

  useInputDebounce(inputRef, (value) => {
    if (value) {
      set('batchNumber', value);
    } else {
      remove('batchNumber');
    }
  });

  return (
    <Input
      ref={inputRef}
      defaultValue={batchNumber ?? ''}
      placeholder='Enter batch number...'
      name='batchNumber'
    />
  );
};

const entryProcessorOptions = enumToOptions(TEntryProcessorTypes).filter(
  (item) => item.label.startsWith('Ledger')
);

const EntryProcessorTypeFilter = () => {
  const [{ entryProcessorType }, set, remove] = useSearchQuery<{
    entryProcessorType: number[];
  }>(['entryProcessorType']);

  const [value, setValue] = useState<string>(
    entryProcessorType ? String(entryProcessorType[0] ?? '') : ''
  );

  const SelectItems = useMemo(
    () =>
      entryProcessorOptions.map(({ label, value }) => (
        <SelectItem key={value} value={String(value)}>
          {label}
        </SelectItem>
      )),
    []
  );

  return (
    <Select
      onValueChange={(value) => {
        setValue(value);
        set('entryProcessorType', [+value]);
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
