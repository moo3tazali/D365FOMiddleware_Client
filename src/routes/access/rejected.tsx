import { createFileRoute } from '@tanstack/react-router';

import { AccessStatusPage } from '@/components/access-status-page';

export const Route = createFileRoute('/access/rejected')({
  component: () => (
    <AccessStatusPage
      title='Access request rejected'
      message='Your request was not approved. Contact the platform administrator if access should be reconsidered.'
    />
  ),
});
