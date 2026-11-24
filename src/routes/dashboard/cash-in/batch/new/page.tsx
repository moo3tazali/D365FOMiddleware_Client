import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { SharedBatchHeader as BatchHeader } from '@/components/batch/shared-batch-header';
import { BatchForm } from '../-components/batch-form';
import { BatchResult } from '../-components/batch-result';
import { BatchFooter } from '../-components/batch-footer';
import {
  CashInTargetContext,
  isMasRevenueTarget,
} from '../-components/cash-in-target-context';
import { MasRevenueReview } from '../-components/mas-revenue/mas-revenue-flow';
import { useMasRevenueReview } from '../-components/mas-revenue/use-mas-revenue-review';

export const Route = createFileRoute('/dashboard/cash-in/batch/new/')({
  component: NewBatchPage,
});

function NewBatchPage() {
  const [target, setTarget] = useState('');
  const mas = useMasRevenueReview();
  const isMas = isMasRevenueTarget(target);

  return (
    <CashInTargetContext.Provider value={{ target, setTarget, mas }}>
      <div className='h-full flex flex-col gap-5'>
        <BatchHeader />
        <BatchForm />
        {isMas && (mas.review || mas.error) ? (
          <MasRevenueReview mas={mas} />
        ) : (
          <BatchResult />
        )}
        <BatchFooter />
      </div>
    </CashInTargetContext.Provider>
  );
}
