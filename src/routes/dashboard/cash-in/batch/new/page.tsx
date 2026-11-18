import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { SharedBatchHeader as BatchHeader } from '@/components/batch/shared-batch-header';
import { TEntryProcessorTypes } from '@/interfaces/data-batch';
import { BatchForm } from '../-components/batch-form';
import { BatchResult } from '../-components/batch-result';
import { BatchFooter } from '../-components/batch-footer';
import { YardInvoiceWorkbench } from '../../yard-invoice/-components/yard-invoice-workbench';

export const Route = createFileRoute('/dashboard/cash-in/batch/new/')({
  component: NewBatchPage,
});

function NewBatchPage() {
  const [selectedType, setSelectedType] = useState('');
  // Yard Document uses the invoice review and posting flow in place of the file batch.
  const isYard = selectedType === String(TEntryProcessorTypes.CashInYard);

  return (
    <div className='h-full flex flex-col gap-5'>
      <BatchHeader />
      <BatchForm onTypeChange={setSelectedType} />
      {isYard ? (
        <YardInvoiceWorkbench />
      ) : (
        <>
          <BatchResult />
          <BatchFooter />
        </>
      )}
    </div>
  );
}
