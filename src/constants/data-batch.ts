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
