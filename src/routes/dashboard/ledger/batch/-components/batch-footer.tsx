import Upload from 'lucide-react/dist/esm/icons/upload';
import CloudUpload from 'lucide-react/dist/esm/icons/cloud-upload';
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
    if (!batch || batch.totalFormattedCount === 0) return <UploadBtn />;

    return <SubmitBtn data={batch} />;
  })();

  return ActionBtn;
};

const UploadBtn = () => {
  const { ledger } = useServices();

  const isUploading = useIsMutating({
    mutationKey: ledger.mutationKey,
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
  const { onSubmit, isPending, validationErrors, closeValidationModal } =
    useSubmitBatch();

  const showSubmit = data.status === TDataBatchStatus.Pending;
  const isAlreadyPosted =
    (data.dfoIds && data.dfoIds.length > 0) ||
    (data.dfoPostingErrors && data.dfoPostingErrors.length > 0);
  const isDisabled = isPending || isAlreadyPosted;

  if (!showSubmit)
    return (
      <Button
        asChild
        size='lg'
        disabled={isPending}
        className='sm:max-w-xs ms-auto w-full'
      >
        <Link to={ROUTES.DASHBOARD.LEDGER.BATCH.NEW}>
          <Upload className='size-5' />
          New Entry
        </Link>
      </Button>
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
          <Link to={ROUTES.DASHBOARD.LEDGER.BATCH.NEW}>
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
          <CloudUpload className='size-5' />
          Post to D365FO
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
