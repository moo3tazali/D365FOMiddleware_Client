import { createFileRoute } from '@tanstack/react-router';

import { BatchHeader } from '../-components/batch-header';
import { BatchForm } from '../-components/batch-form';
import { BatchResult } from '../-components/batch-result';
import { BatchFooter } from '../-components/batch-footer';

export const Route = createFileRoute('/dashboard/vendor/batch/new/')({
  component: NewBatchPage,
});

function NewBatchPage() {
  return (
    <div className='h-full flex flex-col gap-5'>
      <BatchHeader />
      <BatchForm />
      <BatchResult />
      <BatchFooter />
    </div>
  );
}
