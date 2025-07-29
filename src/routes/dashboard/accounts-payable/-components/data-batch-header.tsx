import { Link } from '@tanstack/react-router';
import Upload from 'lucide-react/dist/esm/icons/upload';

import { ROUTES } from '@/router';
import { Button } from '@/components/ui/button';

export const DataBatchHeader = () => {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center gap-5 flex-wrap'>
      <h1>Accounts Payable</h1>

      <div className='flex-1 flex justify-end gap-4'>
        <Button asChild className='w-full sm:max-w-xs' size='lg'>
          <Link to={ROUTES.DASHBOARD.ACCOUNTS_PAYABLE.BATCH.NEW}>
            <Upload className='size-5' />
            Upload Entries
          </Link>
        </Button>
      </div>
    </div>
  );
};
