import { z } from 'zod';
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

const entryProcessorOptions = ENTRY_PROCESSOR_OPTIONS.ACCOUNT_PAYABLE;
const entryProcessorValues = entryProcessorOptions.map(({ value }) => value);

export const DataBatchQuerySchema = z.object({
  batchNumber: z.string().ulid('Batch number is invalid').optional(),
  entryProcessorTypes: z
    .array(z.number())
    .optional()
    .refine(
      (values) =>
        !values ||
        values.length === 0 ||
        values.every((v) => entryProcessorValues.includes(v)),
      {
        message: 'Invalid entryProcessorTypes value(s)',
      }
    ),
});

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

const TargetBatchNumberQuerySchema = DataBatchQuerySchema.pick({
  batchNumber: true,
});

const TargetBatchNumberFilter = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [{ batchNumber }, set, remove] = useSearchQuery(
    TargetBatchNumberQuerySchema
  );

  useInputDebounce(inputRef, (value) => {
    inputRef.current?.setAttribute('aria-invalid', 'false');

    if (value) {
      const result = TargetBatchNumberQuerySchema.safeParse({
        batchNumber: value,
      });

      if (!result.success) {
        inputRef.current?.setAttribute('aria-invalid', 'true');
        return;
      }
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

const EntryProcessorTypeQuerySchema = DataBatchQuerySchema.pick({
  entryProcessorTypes: true,
});

const EntryProcessorTypeFilter = () => {
  const [{ entryProcessorTypes }, set, remove] = useSearchQuery(
    EntryProcessorTypeQuerySchema
  );

  const isValid = useMemo(() => {
    return EntryProcessorTypeQuerySchema.safeParse({ entryProcessorTypes })
      .success;
  }, [entryProcessorTypes]);

  const [value, setValue] = useState<string>(
    entryProcessorTypes ? String(isValid ? entryProcessorTypes[0] : '') : ''
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
        if (isValid) {
          set('entryProcessorTypes', [+value]);
        }
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
