import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatchMissingMasterData } from '@/interfaces/data-batch';

const CustomerSchema = z.object({
  customerAccount: z.string().trim().min(1, 'Customer account is required'),
  taxExemptNumber: z.string().trim(),
  name: z.string().trim().min(1, 'Customer name is required'),
  customerGroupId: z.enum(['Domestic', 'Foreign', 'RelatParty']),
  salesTaxGroup: z.enum(['Taxable', 'Non-Taxabl']),
  paymentTerms: z.enum([
    '0 Days',
    '3 Days',
    '7 Days',
    '15 Days',
    '30 Days',
    '45 Days',
    '60 Days',
  ]),
  partyType: z.enum(['Organization', 'Personal']),
  isSalesTaxIncludedInPrices: z.enum(['Yes', 'No']),
  addressCountryRegionId: z
    .string()
    .trim()
    .min(1, 'Country/region is required'),
  salesCurrencyCode: z.string().trim().min(1, 'Sales currency is required'),
});

export type CreateCustomerFormValues = z.infer<typeof CustomerSchema>;
export type CustomerCreationStage =
  | 'idle'
  | 'checking'
  | 'rollback_succeeded'
  | 'rollback_failed'
  | 'failed';

interface UseCreateCustomerFormOptions {
  missingRecord: TDataBatchMissingMasterData;
  onSuccess: () => void;
}

export function useCreateCustomerForm({
  missingRecord,
  onSuccess,
}: UseCreateCustomerFormOptions) {
  const { masterData, dataBatch, dataBatchError } = useServices();
  const { invalidate } = useInvalidate();
  const [stage, setStage] = useState<CustomerCreationStage>('idle');
  const form = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: customerDefaults(missingRecord),
  });

  const creation = useMutation({
    operationName: 'create customer',
    mutationFn: (values: CreateCustomerFormValues) =>
      masterData.createCustomerFromMissingData(missingRecord.id, values),
    formControl: form.control,
    disableToast: true,
    onMutate: () => setStage('checking'),
    onSuccess: () => {
      invalidate(dataBatch.queryKey);
      invalidate(dataBatchError.queryKey);
      setStage('idle');
      onSuccess();
    },
    onError: (error) => {
      const rollback = error.details?.rollback as
        | { attempted?: boolean; succeeded?: boolean }
        | undefined;
      if (!rollback?.attempted) {
        setStage('failed');
      } else {
        setStage(rollback.succeeded ? 'rollback_succeeded' : 'rollback_failed');
      }
    },
  });

  return {
    form,
    stage,
    isPending: creation.isPending,
    onSubmit: form.handleSubmit((values) => creation.mutate(values)),
  };
}

function customerDefaults(
  record: TDataBatchMissingMasterData,
): CreateCustomerFormValues {
  const isTaxExemptMode = record.missingField === 'TaxExemptNumber';
  return {
    customerAccount: isTaxExemptMode
      ? stringDefault(record, 'CustomerAccount', 'customerAccount')
      : record.missingValue,
    taxExemptNumber: isTaxExemptMode
      ? record.missingValue
      : stringDefault(record, 'TaxExemptNumber', 'taxExemptNumber'),
    name: stringDefault(record, 'Name', 'name'),
    customerGroupId:
      enumDefault(
        record,
        ['Domestic', 'Foreign', 'RelatParty'],
        ['CustomerGroupId', 'customerGroupId'],
      ) ?? 'Domestic',
    salesTaxGroup:
      enumDefault(
        record,
        ['Taxable', 'Non-Taxabl'],
        ['SalesTaxGroup', 'salesTaxGroup'],
      ) ?? 'Taxable',
    paymentTerms:
      enumDefault(
        record,
        [
          '0 Days',
          '3 Days',
          '7 Days',
          '15 Days',
          '30 Days',
          '45 Days',
          '60 Days',
        ],
        ['PaymentTerms', 'paymentTerms'],
      ) ?? '30 Days',
    partyType:
      enumDefault(
        record,
        ['Organization', 'Personal'],
        ['PartyType', 'partyType'],
      ) ?? 'Organization',
    isSalesTaxIncludedInPrices:
      enumDefault(
        record,
        ['Yes', 'No'],
        ['IsSalesTaxIncludedInPrices', 'isSalesTaxIncludedInPrices'],
      ) ?? 'No',
    addressCountryRegionId:
      stringDefault(
        record,
        'AddressCountryRegionId',
        'addressCountryRegionId',
      ) || 'EGY',
    salesCurrencyCode:
      stringDefault(record, 'SalesCurrencyCode', 'salesCurrencyCode') || 'EGP',
  };
}

function stringDefault(
  record: TDataBatchMissingMasterData,
  ...keys: string[]
): string {
  for (const key of keys) {
    const defaultValue = record.formDefaults?.[key];
    if (typeof defaultValue === 'string') return defaultValue;
  }
  return '';
}

function enumDefault<T extends string>(
  record: TDataBatchMissingMasterData,
  options: readonly T[],
  keys: string[],
): T | undefined {
  const defaultValue = stringDefault(record, ...keys);
  return options.find((option) => option === defaultValue);
}
