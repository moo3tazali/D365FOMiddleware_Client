import { Link } from '@tanstack/react-router';

import { ROUTES } from '@/router';
import { Button } from '@/components/ui/button';

export const AccountsReceivableHeader = () => {
  return (
    <div className='flex items-center gap-5 flex-wrap'>
      <h1>Accounts Receivable</h1>

      <div className='flex-1 flex justify-end gap-4'>
        <Button asChild className='w-full max-w-xs'>
          <Link to={ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.NEW}>
            Upload Entries
          </Link>
        </Button>
      </div>
    </div>
  );
};
