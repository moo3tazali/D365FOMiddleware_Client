import Upload from 'lucide-react/dist/esm/icons/upload';
import Rocket from 'lucide-react/dist/esm/icons/rocket';
import { useIsMutating } from '@tanstack/react-query';

import { TDataBatchStatus, type TDataBatch } from '@/interfaces/data-batch';
import { Button } from '@/components/ui/button';
import { useServices } from '@/hooks/use-services';
import { useBatchQueryData } from '../-hooks/use-batch-query-data';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '@/router';
import { useSubmitBatch } from '../-hooks/use-submit-batch';

export const BatchFooter = () => {
  const [batch] = useBatchQueryData();

  const ActionBtn = (() => {
    if (!batch || batch.totalFormattedCount === 0) return <UploadBtn />;

    return <SubmitBtn data={batch} />;
  })();

  return ActionBtn;
};

const UploadBtn = () => {
  const { accountReceivable } = useServices();

  const isUploading = useIsMutating({
    mutationKey: accountReceivable.mutationKey,
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
  const { onSubmit, isPending } = useSubmitBatch();

  const showSubmit = data.status === TDataBatchStatus.Pending;

  if (!showSubmit)
    return (
      <Button
        asChild
        size='lg'
        disabled={isPending}
        className='sm:max-w-xs ms-auto w-full'
      >
        <Link to={ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.BATCH.NEW}>
          <Upload className='size-5' />
          New Entry
        </Link>
      </Button>
    );
  return (
    <div className='flex sm:flex-row gap-2.5 w-full ms-auto sm:max-w-xl *:flex-1'>
      <Button
        asChild
        size='lg'
        disabled={isPending}
        className={isPending ? 'opacity-50 pointer-events-none' : ''}
      >
        <Link to={ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.BATCH.NEW}>
          <Upload className='size-5' />
          New Entry
        </Link>
      </Button>

      <Button
        size='lg'
        variant='success'
        disabled={isPending}
        onClick={() => onSubmit(data)}
      >
        <Rocket className='size-5' />
        Submit
      </Button>
    </div>
  );
};
