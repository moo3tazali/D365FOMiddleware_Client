import { createContext, useContext } from 'react';

import { TEntryProcessorTypes } from '@/interfaces/data-batch';

/**
 * The Target Service chosen on the new-batch page. The generic uploader and its
 * footer action use it to step aside for the MAS flow. Other targets are unaffected.
 */
export interface CashInTargetState {
  target: string;
  setTarget: (value: string) => void;
}

export const CashInTargetContext = createContext<CashInTargetState | null>(
  null,
);

export const useCashInTarget = () => useContext(CashInTargetContext);

export const isMasRevenueTarget = (value: string | undefined | null) =>
  value === String(TEntryProcessorTypes.CashInMasRevenue);
