import { useState } from 'react';
import { useServices } from '@/hooks/use-services';
import { useInvalidate } from '@/hooks/use-invalidate';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalClose,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import type { TDataBatchMissingMasterData } from '@/interfaces/data-batch';

interface CreateCustomerModalProps {
  missingRecord: TDataBatchMissingMasterData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function getStringDefault(
  record: TDataBatchMissingMasterData,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = record.formDefaults?.[key];
    if (typeof value === 'string') {
      return value;
    }
  }
  return '';
}

export function CreateCustomerModal({
  missingRecord,
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateCustomerModalProps) {
  const { masterData, dataBatch, dataBatchError } = useServices();
  const { invalidate } = useInvalidate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Determine if we are resolving by tax number or customer account
  const isTaxExemptMode = missingRecord.missingField === 'TaxExemptNumber';
  const customerAccountReadonly =
    missingRecord.readonlyFormFields.includes('CustomerAccount');
  const taxExemptNumberReadonly =
    missingRecord.readonlyFormFields.includes('TaxExemptNumber');

  // Form states
  const [customerAccount, setCustomerAccount] = useState(() => {
    if (isTaxExemptMode) {
      return getStringDefault(
        missingRecord,
        'CustomerAccount',
        'customerAccount',
      );
    }
    return missingRecord.missingValue;
  });

  const [taxExemptNumber, setTaxExemptNumber] = useState(() => {
    if (isTaxExemptMode) {
      return missingRecord.missingValue;
    }
    return getStringDefault(
      missingRecord,
      'TaxExemptNumber',
      'taxExemptNumber',
    );
  });

  const [name, setName] = useState(() =>
    getStringDefault(missingRecord, 'Name', 'name'),
  );
  const [customerGroupId, setCustomerGroupId] = useState(
    () =>
      getStringDefault(missingRecord, 'CustomerGroupId', 'customerGroupId') ||
      'Domestic',
  );
  const [salesTaxGroup, setSalesTaxGroup] = useState(
    () =>
      getStringDefault(missingRecord, 'SalesTaxGroup', 'salesTaxGroup') ||
      'Taxable',
  );
  const [paymentTerms, setPaymentTerms] = useState(
    () =>
      getStringDefault(missingRecord, 'PaymentTerms', 'paymentTerms') ||
      '30 Days',
  );
  const [partyType, setPartyType] = useState(
    () =>
      getStringDefault(missingRecord, 'PartyType', 'partyType') ||
      'Organization',
  );
  const [isSalesTaxIncludedInPrices, setIsSalesTaxIncludedInPrices] = useState(
    () =>
      getStringDefault(
        missingRecord,
        'IsSalesTaxIncludedInPrices',
        'isSalesTaxIncludedInPrices',
      ) || 'No',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerAccount.trim() || !name.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await masterData.createCustomerFromMissingData(missingRecord.id, {
        customerAccount,
        name,
        customerGroupId,
        salesTaxGroup,
        paymentTerms,
        partyType,
        isSalesTaxIncludedInPrices,
        addressCountryRegionId: 'EGY',
        salesCurrencyCode: 'EGP',
        taxExemptNumber,
      });

      // Invalidate queries to refresh lists
      invalidate(dataBatch.queryKey);
      invalidate(dataBatchError.queryKey);
      invalidate(['data-batch']);

      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while creating the customer.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className='max-w-md w-full p-6 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl'>
        <ResponsiveModalHeader className='mb-4'>
          <ResponsiveModalTitle className='text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50'>
            Create Customer Inline
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className='text-sm text-zinc-500 dark:text-zinc-400'>
            Fill in the details below to create this customer in D365FO.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {errorMsg && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className='text-xs'>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1 text-left'>
              <Label
                htmlFor='customerAccount'
                className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'
              >
                Customer Account *
              </Label>
              <Input
                id='customerAccount'
                placeholder='e.g. C000001'
                required
                disabled={customerAccountReadonly}
                value={customerAccount}
                onChange={(e) => setCustomerAccount(e.target.value)}
                className={`h-9 text-sm ${
                  customerAccountReadonly
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : ''
                }`}
              />
            </div>
            <div className='space-y-1 text-left'>
              <Label
                htmlFor='taxNo'
                className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'
              >
                {taxExemptNumberReadonly ? 'Tax No (Read-only)' : 'Tax No'}
              </Label>
              <Input
                id='taxNo'
                disabled={taxExemptNumberReadonly}
                value={taxExemptNumber || ''}
                onChange={(e) => setTaxExemptNumber(e.target.value)}
                className={`h-9 text-sm ${
                  taxExemptNumberReadonly
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : ''
                }`}
              />
            </div>
          </div>

          <div className='space-y-1 text-left'>
            <Label
              htmlFor='name'
              className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'
            >
              Customer Name *
            </Label>
            <Input
              id='name'
              placeholder='e.g. Acme Corporation'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='h-9 text-sm'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1 text-left'>
              <Label className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'>
                Customer Group
              </Label>
              <Select
                value={customerGroupId}
                onValueChange={setCustomerGroupId}
              >
                <SelectTrigger className='w-full h-9 text-sm'>
                  <SelectValue placeholder='Select Group' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Domestic'>Domestic</SelectItem>
                  <SelectItem value='Foreign'>Foreign</SelectItem>
                  <SelectItem value='RelatParty'>RelatParty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1 text-left'>
              <Label className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'>
                Party Type
              </Label>
              <Select value={partyType} onValueChange={setPartyType}>
                <SelectTrigger className='w-full h-9 text-sm'>
                  <SelectValue placeholder='Select Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Organization'>Organization</SelectItem>
                  <SelectItem value='Personal'>Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1 text-left'>
              <Label className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'>
                Sales Tax Group
              </Label>
              <Select value={salesTaxGroup} onValueChange={setSalesTaxGroup}>
                <SelectTrigger className='w-full h-9 text-sm'>
                  <SelectValue placeholder='Select Tax Group' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Taxable'>Taxable</SelectItem>
                  <SelectItem value='Non-Taxabl'>Non-Taxabl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1 text-left'>
              <Label className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'>
                Tax Included In Prices
              </Label>
              <Select
                value={isSalesTaxIncludedInPrices}
                onValueChange={setIsSalesTaxIncludedInPrices}
              >
                <SelectTrigger className='w-full h-9 text-sm'>
                  <SelectValue placeholder='Include Tax?' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Yes'>Yes</SelectItem>
                  <SelectItem value='No'>No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1 text-left'>
              <Label className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'>
                Payment Terms
              </Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger className='w-full h-9 text-sm'>
                  <SelectValue placeholder='Select Terms' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0 Days'>0 Days</SelectItem>
                  <SelectItem value='3 Days'>3 Days</SelectItem>
                  <SelectItem value='7 Days'>7 Days</SelectItem>
                  <SelectItem value='15 Days'>15 Days</SelectItem>
                  <SelectItem value='30 Days'>30 Days</SelectItem>
                  <SelectItem value='45 Days'>45 Days</SelectItem>
                  <SelectItem value='60 Days'>60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-2 gap-2 text-left'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold text-zinc-400 dark:text-zinc-500'>
                  Country
                </Label>
                <Input
                  disabled
                  value='EGY'
                  className='h-9 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold text-zinc-400 dark:text-zinc-500'>
                  Currency
                </Label>
                <Input
                  disabled
                  value='EGP'
                  className='h-9 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                />
              </div>
            </div>
          </div>

          <ResponsiveModalFooter className='pt-4 border-t border-zinc-100 dark:border-zinc-900 gap-2'>
            <ResponsiveModalClose asChild>
              <Button
                type='button'
                variant='outline'
                className='h-9 text-sm border-zinc-300 dark:border-zinc-700'
              >
                Cancel
              </Button>
            </ResponsiveModalClose>
            <Button
              type='submit'
              disabled={loading}
              className='h-9 text-sm bg-primary text-primary-foreground font-semibold px-4 hover:opacity-90 transition-opacity'
            >
              {loading ? 'Creating...' : 'Create Customer'}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
