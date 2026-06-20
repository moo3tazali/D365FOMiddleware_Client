import { createFileRoute } from '@tanstack/react-router';

import { AccessStatusPage } from '@/components/access-status-page';

export const Route = createFileRoute('/access/pending')({
  component: () => (
    <AccessStatusPage
      title='Access request pending'
      message='Your identity is verified. Wait for the platform administrator to approve access.'
      poll
    />
  ),
});
