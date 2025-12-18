import { TEntryProcessorTypes } from '@/interfaces/data-batch';

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
  ],
  CASH_IN: [
    {
      label: 'Freight Document',
      value: TEntryProcessorTypes.CashInFreight,
    },
  ],
  CASH_OUT: [
    {
      label: 'Freight Document',
      value: TEntryProcessorTypes.CashOutFreight,
    },
  ],
} as const;
