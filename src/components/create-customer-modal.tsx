import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormErrorMessage } from '@/components/ui/form-error-message';
import { Input } from '@/components/ui/input';
import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCustomerForm } from '@/hooks/use-create-customer-form';
import type { TDataBatchMissingMasterData } from '@/interfaces/data-batch';

interface CreateCustomerModalProps {
  missingRecord: TDataBatchMissingMasterData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCustomerModal({
  missingRecord,
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateCustomerModalProps) {
  const customerAccountReadonly =
    missingRecord.readonlyFormFields.includes('CustomerAccount');
  const taxExemptNumberReadonly =
    missingRecord.readonlyFormFields.includes('TaxExemptNumber');
  const creation = useCreateCustomerForm({
    missingRecord,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className='max-w-md w-full p-6'>
        <ResponsiveModalHeader className='mb-4'>
          <ResponsiveModalTitle>Create Customer Inline</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Create the missing customer in D365FO. Tax number setup is checked
            directly against D365FO before creation.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <CreationStatus stage={creation.stage} />

        <Form {...creation.form}>
          <form onSubmit={creation.onSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <TextField
                control={creation.form.control}
                name='customerAccount'
                label='Customer Account *'
                disabled={customerAccountReadonly || creation.isPending}
              />
              <TextField
                control={creation.form.control}
                name='taxExemptNumber'
                label={
                  taxExemptNumberReadonly ? 'Tax No (Read-only)' : 'Tax No'
                }
                disabled={taxExemptNumberReadonly || creation.isPending}
              />
            </div>

            <TextField
              control={creation.form.control}
              name='name'
              label='Customer Name *'
              disabled={creation.isPending}
            />

            <div className='grid grid-cols-2 gap-4'>
              <SelectField
                control={creation.form.control}
                name='customerGroupId'
                label='Customer Group'
                options={['Domestic', 'Foreign', 'RelatParty']}
                disabled={creation.isPending}
              />
              <SelectField
                control={creation.form.control}
                name='partyType'
                label='Party Type'
                options={['Organization', 'Personal']}
                disabled={creation.isPending}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <SelectField
                control={creation.form.control}
                name='salesTaxGroup'
                label='Sales Tax Group'
                options={['Taxable', 'Non-Taxabl']}
                disabled={creation.isPending}
              />
              <SelectField
                control={creation.form.control}
                name='isSalesTaxIncludedInPrices'
                label='Tax Included In Prices'
                options={['Yes', 'No']}
                disabled={creation.isPending}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <SelectField
                control={creation.form.control}
                name='paymentTerms'
                label='Payment Terms'
                options={[
                  '0 Days',
                  '3 Days',
                  '7 Days',
                  '15 Days',
                  '30 Days',
                  '45 Days',
                  '60 Days',
                ]}
                disabled={creation.isPending}
              />
              <div className='grid grid-cols-2 gap-2'>
                <TextField
                  control={creation.form.control}
                  name='addressCountryRegionId'
                  label='Country/Region'
                  disabled
                />
                <TextField
                  control={creation.form.control}
                  name='salesCurrencyCode'
                  label='Sales Currency'
                  disabled
                />
              </div>
            </div>

            <FormErrorMessage>
              {creation.form.formState.errors.root?.message}
            </FormErrorMessage>

            <ResponsiveModalFooter className='pt-4 border-t gap-2'>
              <ResponsiveModalClose asChild>
                <Button type='button' variant='outline'>
                  Cancel
                </Button>
              </ResponsiveModalClose>
              <Button type='submit' disabled={creation.isPending}>
                {creation.isPending && <Loader2 className='animate-spin' />}
                {creation.isPending ? 'Creating...' : 'Create Customer'}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function CreationStatus({
  stage,
}: {
  stage: ReturnType<typeof useCreateCustomerForm>['stage'];
}) {
  if (stage === 'idle') return null;
  const messages = {
    checking:
      'Checking existing customer account, tax number, and VAT number setup...',
    rollback_succeeded:
      'Customer creation failed. The VAT number created by this operation was rolled back.',
    rollback_failed:
      'Customer creation failed, and the temporary VAT number could not be rolled back.',
    failed: 'Customer creation did not complete.',
  };
  const isChecking = stage === 'checking';
  return (
    <Alert variant={isChecking ? 'default' : 'destructive'} className='mb-4'>
      {isChecking ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <AlertCircle className='h-4 w-4' />
      )}
      <AlertTitle>
        {isChecking ? 'D365FO progress' : 'Creation failed'}
      </AlertTitle>
      <AlertDescription>{messages[stage]}</AlertDescription>
    </Alert>
  );
}

type CustomerControl = ReturnType<
  typeof useCreateCustomerForm
>['form']['control'];
type CustomerFieldName =
  | 'customerAccount'
  | 'taxExemptNumber'
  | 'name'
  | 'addressCountryRegionId'
  | 'salesCurrencyCode';

function TextField({
  control,
  name,
  label,
  disabled,
}: {
  control: CustomerControl;
  name: CustomerFieldName;
  label: string;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type SelectFieldName =
  | 'customerGroupId'
  | 'salesTaxGroup'
  | 'paymentTerms'
  | 'partyType'
  | 'isSalesTaxIncludedInPrices';

function SelectField({
  control,
  name,
  label,
  options,
  disabled,
}: {
  control: CustomerControl;
  name: SelectFieldName;
  label: string;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
