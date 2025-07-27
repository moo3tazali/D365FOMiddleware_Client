import { Rocket, Upload } from 'lucide-react';
import { useIsMutating } from '@tanstack/react-query';

import type { TDataBatch } from '@/interfaces/data-batch';
import { Button } from '@/components/ui/button';
import { useServices } from '@/hooks/use-services';
import { useBatchQueryData } from '../-hooks/use-batch-query-data';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '@/router';

export const BatchFooter = () => {
  const [batch] = useBatchQueryData();

  const ActionBtn = (() => {
    if (!batch || !batch?.totalUploadedCount) return <UploadBtn />;

    if (batch && batch.errorCount) return <UploadBtn />;

    return <SubmitBtn data={batch} />;
  })();

  return ActionBtn;
};

const UploadBtn = () => {
  const { accountReceivable } = useServices();

  const isUploading = useIsMutating({
    mutationKey: [accountReceivable.mutationKey],
  });

  return (
    <Button
      size='lg'
      className='w-full flex sm:max-w-xs ms-auto'
      onClick={() => {
        document.getElementById('upload_entries_btn')?.click();
      }}
      disabled={isUploading > 0}
    >
      <Upload className='size-5' />
      Upload
    </Button>
  );
};

const SubmitBtn = ({ data }: { data: TDataBatch }) => {
  return (
    <div className='flex  sm:flex-row gap-2.5 w-full ms-auto sm:max-w-xl *:flex-1'>
      <Button asChild size='lg'>
        <Link to={ROUTES.DASHBOARD.LEDGER.BATCH.NEW}>
          <Upload className='size-5' />
          New Entry
        </Link>
      </Button>

      <Button
        size='lg'
        variant='success'
        disabled={false}
        onClick={() => {
          console.log(data);
        }}
      >
        <Rocket className='size-5' />
        Submit
      </Button>
    </div>
  );
};
