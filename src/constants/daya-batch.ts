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
      value: TEntryProcessorTypes.AccountPayableFreightVendorEntry,
    },
    {
      label: 'Trucking Vendor',
      value: TEntryProcessorTypes.AccountPayableTruckingVendorEntry,
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
} as const;
