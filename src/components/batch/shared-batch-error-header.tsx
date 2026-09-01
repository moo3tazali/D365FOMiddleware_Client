import DownloadIcon from 'lucide-react/dist/esm/icons/download';
import { useParams } from '@tanstack/react-router';

import { Description } from '@/components/ui/description';
import { Button } from '@/components/ui/button';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';

export const SharedBatchErrorHeader = () => {
  const { batchId } = useParams({ strict: false });
  const { dataBatch } = useServices();
  const { mutateAsync: onDownloadError, isPending } = useMutation({
    operationName: 'download record errors',
    mutationFn: () =>
      dataBatch.downloadBatchErrorList({ batchId: String(batchId) }),
  });

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
      <div>
        <h1>Batch Errors</h1>
        <Description>
          Skipped UniqueIds and validation errors for this batch. Download the
          Excel file for UniqueId, Excel LINENUMBER, and reason.
        </Description>
      </div>
      {batchId && (
        <Button
          variant='destructive'
          disabled={isPending}
          onClick={() => onDownloadError(undefined)}
        >
          <DownloadIcon className='size-4' />
          Download error Excel
        </Button>
      )}
    </div>
  );
};
