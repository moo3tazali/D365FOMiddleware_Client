import { createFileRoute } from '@tanstack/react-router';

import { AccessStatusPage } from '@/components/access-status-page';

export const Route = createFileRoute('/access/revoked')({
  component: () => (
    <AccessStatusPage
      title='Access revoked'
      message='Your previous platform access has been withdrawn. Contact the platform administrator for assistance.'
    />
  ),
});
