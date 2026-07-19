import Upload from 'lucide-react/dist/esm/icons/upload';
import CloudUpload from 'lucide-react/dist/esm/icons/cloud-upload';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import { useIsMutating } from '@tanstack/react-query';

import { TDataBatchStatus, type TDataBatch } from '@/interfaces/data-batch';
import { Button } from '@/components/ui/button';
import { useServices } from '@/hooks/use-services';
import { useBatchQueryData } from '../-hooks/use-batch-query-data';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '@/router';
import { useSubmitBatch } from '../-hooks/use-submit-batch';
import { ValidationErrorsModal } from '@/routes/dashboard/accounts-receivable/batch/-components/validation-errors-modal';

export const BatchFooter = () => {
  const [batch] = useBatchQueryData();

  const ActionBtn = (() => {
    if (!batch) return <UploadBtn />;
    if (batch.totalFormattedCount === 0) return <NewEntryBtn />;

    return <SubmitBtn data={batch} />;
  })();

  return <div className='pt-4 border-t border-border'>{ActionBtn}</div>;
};

const UploadBtn = () => {
  const { cashOut } = useServices();

  const isUploading = useIsMutating({
    mutationKey: cashOut.mutationKey,
  });

  return (
    <div className='flex justify-end'>
      <Button
        size='lg'
        className='w-full sm:max-w-xs'
        onClick={() => {
          document.getElementById('upload_entries_btn')?.click();
        }}
        disabled={isUploading > 0}
      >
        <Upload className='size-5' />
        Upload
      </Button>
    </div>
  );
};

const NewEntryBtn = () => (
  <div className='flex justify-end'>
    <Button asChild size='lg' className='w-full sm:max-w-xs'>
      <Link to={ROUTES.DASHBOARD.CASH_OUT.BATCH.NEW}>
        <Upload className='size-5' />
        New Entry
      </Link>
    </Button>
  </div>
);

const SubmitBtn = ({ data }: { data: TDataBatch }) => {
  const { onSubmit, isPending, validationErrors, closeValidationModal } =
    useSubmitBatch();

  const showSubmit =
    data.status === TDataBatchStatus.PendingPosting ||
    data.status === TDataBatchStatus.Canceled;
  const isAlreadyPosted =
    (data.dfoIds && data.dfoIds.length > 0) ||
    (data.dfoPostingErrors && data.dfoPostingErrors.length > 0);
  const canRetry = data.status === TDataBatchStatus.Canceled;
  const isDisabled = isPending || (isAlreadyPosted && !canRetry);

  if (!showSubmit)
    return (
      <div className='flex justify-end'>
        <Button
          asChild
          size='lg'
          disabled={isPending}
          className='w-full sm:max-w-xs'
        >
          <Link to={ROUTES.DASHBOARD.CASH_OUT.BATCH.NEW}>
            <Upload className='size-5' />
            New Entry
          </Link>
        </Button>
      </div>
    );
  return (
    <>
      <div className='flex sm:flex-row gap-2.5 w-full ms-auto sm:max-w-xl *:flex-1'>
        <Button
          asChild
          size='lg'
          disabled={isPending}
          className={isPending ? 'opacity-50 pointer-events-none' : ''}
        >
          <Link to={ROUTES.DASHBOARD.CASH_OUT.BATCH.NEW}>
            <Upload className='size-5' />
            New Entry
          </Link>
        </Button>

        <Button
          size='lg'
          variant='success'
          disabled={isDisabled}
          onClick={() => onSubmit(data)}
        >
          {canRetry ? (
            <>
              <RotateCcw className='size-5' />
              Retry
            </>
          ) : (
            <>
              <CloudUpload className='size-5' />
              Post to D365FO
            </>
          )}
        </Button>
      </div>
      {validationErrors && (
        <ValidationErrorsModal
          open={!!validationErrors}
          onClose={closeValidationModal}
          validationErrors={validationErrors}
        />
      )}
    </>
  );
};
