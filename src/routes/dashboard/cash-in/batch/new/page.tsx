import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { SharedBatchHeader as BatchHeader } from '@/components/batch/shared-batch-header';
import { BatchForm } from '../-components/batch-form';
import { BatchResult } from '../-components/batch-result';
import { BatchFooter } from '../-components/batch-footer';
import { CashInTargetContext } from '../-components/cash-in-target-context';

export const Route = createFileRoute('/dashboard/cash-in/batch/new/')({
  component: NewBatchPage,
});

function NewBatchPage() {
  const [target, setTarget] = useState('');

  return (
    <CashInTargetContext.Provider value={{ target, setTarget }}>
      <div className='h-full flex flex-col gap-5'>
        <BatchHeader />
        <BatchForm />
        <BatchResult />
        <BatchFooter />
      </div>
    </CashInTargetContext.Provider>
  );
}
