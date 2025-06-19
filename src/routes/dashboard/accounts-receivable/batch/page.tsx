import { createFileRoute } from '@tanstack/react-router';

import { UploadEntriesHeader } from './-components/upload-entries-header';
import { UploadEntriesForm } from './-components/upload-entries-form';
import { UploadEntriesResult } from './-components/upload-entries-result';
import { UploadEntriesFooter } from './-components/upload-entries-footer';

export const Route = createFileRoute(
  '/dashboard/accounts-receivable/batch/'
)({
  component: UploadEntriesPage,
});

function UploadEntriesPage() {
  return (
    <div className='h-full flex flex-col gap-5'>
      <UploadEntriesHeader />
      <UploadEntriesForm />
      <UploadEntriesResult />
      <UploadEntriesFooter />
    </div>
  );
}
