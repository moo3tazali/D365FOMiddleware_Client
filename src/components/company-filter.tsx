import { z } from 'zod';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COMPANY_CODE_VALUES, COMPANY_OPTIONS } from '@/constants/company';
import { useSearchQuery } from '@/hooks/use-search-query';

/** Search parameter for the Company filter on batch lists. Server-side. */
export const CompanyFilterQuerySchema = z.object({
  company: z.enum(COMPANY_CODE_VALUES).optional(),
});

/** Company filter for batch lists. Clearing it shows every company. */
export const CompanyFilter = () => {
  const [{ company }, set, remove] = useSearchQuery(CompanyFilterQuerySchema);

  return (
    <Select
      value={company ?? ''}
      onValueChange={(value) => set('company', value)}
      name='company'
    >
      <SelectTrigger
        clearable
        onClear={() => remove('company')}
        className='w-full'
        aria-label='Filter by company'
      >
        <SelectValue placeholder='All companies' />
      </SelectTrigger>
      <SelectContent>
        {COMPANY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
