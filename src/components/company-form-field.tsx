import type { Control, FieldValues, Path } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COMPANY_OPTIONS } from '@/constants/company';

interface CompanyFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  /** Form field that holds the company code. */
  name?: Path<T>;
  disabled?: boolean;
  /**
   * Called after the value changes. Use it to clear company-dependent
   * selections (uploaded file, billing classification, previews).
   */
  onCompanyChange?: (value: string) => void;
}

/**
 * Required company selector for every upload form. There is no default:
 * the user must choose a company before an upload can be sent.
 */
export const CompanyFormField = <T extends FieldValues>({
  control,
  name = 'companyId' as Path<T>,
  disabled,
  onCompanyChange,
}: CompanyFormFieldProps<T>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>Company</FormLabel>
        <Select
          value={field.value ? String(field.value) : undefined}
          onValueChange={(value) => {
            field.onChange(value);
            onCompanyChange?.(value);
          }}
          disabled={disabled}
          name={String(name)}
        >
          <FormControl>
            <SelectTrigger className='w-full' aria-label='Company'>
              <SelectValue placeholder='Select the company' />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {COMPANY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);
