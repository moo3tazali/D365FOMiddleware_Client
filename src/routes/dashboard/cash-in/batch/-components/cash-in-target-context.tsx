import { createContext, useContext } from 'react';

import { TEntryProcessorTypes } from '@/interfaces/data-batch';

import type { MasRevenueReviewState } from './mas-revenue/use-mas-revenue-review';

/**
 * The Target Service chosen on the new-batch page. The standard uploader and footer
 * use it to run the MAS Revenue review for the MAS target. Other targets are unaffected.
 */
export interface CashInTargetState {
  target: string;
  setTarget: (value: string) => void;
  /** MAS Revenue review state, used only when the MAS target is selected. */
  mas: MasRevenueReviewState;
}

export const CashInTargetContext = createContext<CashInTargetState | null>(
  null,
);

export const useCashInTarget = () => useContext(CashInTargetContext);

export const isMasRevenueTarget = (value: string | undefined | null) =>
  value === String(TEntryProcessorTypes.CashInMasRevenue);
