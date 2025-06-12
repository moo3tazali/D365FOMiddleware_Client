import { createFileRoute } from '@tanstack/react-router';

import { UploadEntriesHeader } from './-components/upload-entries-header';
import { UploadEntriesForm } from './-components/upload-entries-form';

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/upload-entries/'
)({
  component: UploadEntriesPage,
});

function UploadEntriesPage() {
  return (
    <div className='h-full space-y-5'>
      <UploadEntriesHeader />
      <UploadEntriesForm />
    </div>
  );
}
