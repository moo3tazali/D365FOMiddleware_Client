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
import { useSearchQuery } from '@/hooks/use-search-query';
import { ENTRY_PROCESSOR_OPTIONS } from '@/constants/daya-batch';

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

const entryProcessorOptions = ENTRY_PROCESSOR_OPTIONS.LEDGER;

const EntryProcessorTypeFilter = () => {
  const [{ entryProcessorTypes }, set, remove] = useSearchQuery<{
    entryProcessorTypes: number[];
  }>(['entryProcessorTypes']);

  const [value, setValue] = useState<string>(
    entryProcessorTypes ? String(entryProcessorTypes[0] ?? '') : ''
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
        set('entryProcessorTypes', [+value]);
      }}
      value={value}
      disabled={false}
      name='entryProcessorTypes'
    >
      <SelectTrigger
        value={value}
        clearable
        onClear={() => {
          setValue('');
          remove('entryProcessorTypes');
        }}
        className='w-full'
      >
        <SelectValue placeholder='Select module...' />
      </SelectTrigger>

      <SelectContent>{SelectItems}</SelectContent>
    </Select>
  );
};
