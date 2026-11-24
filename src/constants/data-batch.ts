import { TEntryProcessorTypes } from '@/interfaces/data-batch';

/**
 * Cash In batch-list filter options. MAS Revenue (type 33) is left out until the
 * backend that lists it is live: the current live backend rejects the whole list
 * request when it receives type 33. The upload form still offers MAS Revenue.
 * Restore the full CASH_IN options here once the backend is deployed.
 */
export const CASH_IN_LIST_PROCESSOR_TYPES: readonly TEntryProcessorTypes[] = [
  TEntryProcessorTypes.CashInFreight,
  TEntryProcessorTypes.CashInTrucking,
  TEntryProcessorTypes.CashInShiplink,
  TEntryProcessorTypes.CashInYard,
];

export const ACCOUNT_RECEIVABLE_ENTRY_PROCESSOR_TYPES = [
  TEntryProcessorTypes.AccountReceivableFreight,
  TEntryProcessorTypes.AccountReceivableTrucking,
  TEntryProcessorTypes.AccountReceivableFreightCreditNote,
  TEntryProcessorTypes.AccountReceivableTruckingCreditNote,
  TEntryProcessorTypes.AccountReceivableYard,
  TEntryProcessorTypes.AccountReceivableShippingLines,
] as const;

export const isAccountReceivableEntryProcessorType = (
  entryProcessorType: TEntryProcessorTypes,
) =>
  (
    ACCOUNT_RECEIVABLE_ENTRY_PROCESSOR_TYPES as readonly TEntryProcessorTypes[]
  ).includes(entryProcessorType);

export const getExpectedGroupCountLabel = (
  entryProcessorType: TEntryProcessorTypes,
) =>
  isAccountReceivableEntryProcessorType(entryProcessorType)
    ? 'invoice(s)'
    : 'BatchNumber(s)';

export const ENTRY_PROCESSOR_OPTIONS = {
  ACCOUNT_RECEIVABLE: [
    {
      label: 'Freight',
      value: TEntryProcessorTypes.AccountReceivableFreight,
    },
    {
      label: 'Trucking',
      value: TEntryProcessorTypes.AccountReceivableTrucking,
    },
    {
      label: 'Freight Credit Note',
      value: TEntryProcessorTypes.AccountReceivableFreightCreditNote,
    },
    {
      label: 'Trucking Credit Note',
      value: TEntryProcessorTypes.AccountReceivableTruckingCreditNote,
    },
    {
      label: 'Yard',
      value: TEntryProcessorTypes.AccountReceivableYard,
    },
    {
      label: 'Shipping Lines',
      value: TEntryProcessorTypes.AccountReceivableShippingLines,
    },
  ],
  ACCOUNT_PAYABLE: [
    {
      label: 'Freight Vendor',
      value: TEntryProcessorTypes.AccountPayableFreight,
    },
    {
      label: 'Trucking Vendor',
      value: TEntryProcessorTypes.AccountPayableTrucking,
    },
  ],
  LEDGER: [
    {
      label: 'Freight Closing',
      value: TEntryProcessorTypes.LedgerFreightClosingEntry,
    },
    {
      label: 'Trucking Closing',
      value: TEntryProcessorTypes.LedgerTruckingClosingEntry,
    },
    {
      label: 'Custody Settlement',
      value: TEntryProcessorTypes.LedgerCustodySettlement,
    },
    {
      label: 'Freight Closing Difference',
      value: TEntryProcessorTypes.LedgerFreightClosingDifference,
    },
  ],
  CASH_MANAGEMENT: [
    {
      label: 'Cash Out',
      value: [
        TEntryProcessorTypes.LedgerCashOut,
        TEntryProcessorTypes.LedgerBankOut,
        TEntryProcessorTypes.LedgerVisaOut,
      ],
    },
  ],
  VENDOR: [
    {
      label: 'Freight Vendor',
      value: TEntryProcessorTypes.VendorFreight,
    },
    {
      label: 'Trucking Vendor',
      value: TEntryProcessorTypes.VendorTrucking,
    },
    {
      label: 'Freight Vendor Adjustment',
      value: TEntryProcessorTypes.VendorFreightAdjustment,
    },
    {
      label: 'Trucking Vendor Adjustment',
      value: TEntryProcessorTypes.VendorTruckingAdjustment,
    },
    {
      label: 'Payment Freight',
      value: TEntryProcessorTypes.VendorPaymentFreight,
    },
    {
      label: 'Payment Trucking',
      value: TEntryProcessorTypes.VendorPaymentTrucking,
    },
  ],
  CASH_IN: [
    {
      label: 'Freight Document',
      value: TEntryProcessorTypes.CashInFreight,
    },
    {
      label: 'Fleet (trucking) Document',
      value: TEntryProcessorTypes.CashInTrucking,
    },
    {
      label: 'Shiplink Document',
      value: TEntryProcessorTypes.CashInShiplink,
    },
    {
      label: 'Yard Document',
      value: TEntryProcessorTypes.CashInYard,
    },
    {
      label: 'MAS Revenue Cash In',
      value: TEntryProcessorTypes.CashInMasRevenue,
    },
  ],
  CASH_OUT: [
    {
      label: 'Freight Document',
      value: TEntryProcessorTypes.CashOutFreight,
    },
    {
      label: 'Fleet (trucking) Document',
      value: TEntryProcessorTypes.CashOutTrucking,
    },
  ],
} as const;
