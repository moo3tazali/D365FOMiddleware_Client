import toast from 'react-hot-toast';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ClipboardCopy from 'lucide-react/dist/esm/icons/clipboard-copy';
import DownloadIcon from 'lucide-react/dist/esm/icons/download';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { useLocation, useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBatchReprocess } from '@/hooks/use-batch-reprocess';
import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';
import { useAuth } from '@/hooks/use-auth';
import { TDataBatchStatus } from '@/interfaces/data-batch';
import type { TDataBatch } from '@/interfaces/data-batch';

interface BatchActionsDropdownProps {
  batch?: TDataBatch;
}

export function BatchActionsDropdown({ batch }: BatchActionsDropdownProps) {
  const { dataBatch } = useServices();
  const user = useAuth((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    canReprocess,
    disabledReason: reprocessDisabledReason,
    isPending: isReprocessPending,
    reprocess,
  } = useBatchReprocess(batch);

  const isReprocessDisabled = !batch || !canReprocess || isReprocessPending;

  const canDelete =
    batch &&
    (user?.role === 'ADMIN' ||
      (Boolean(user?.id) && batch.createdByUserId === user?.id)) &&
    batch.status !== TDataBatchStatus.Posted;

  const parentPath = location.pathname.split('/batch/')[0];

  const { mutateAsync: onDownload } = useMutation({
    operationName: 'download record',
    mutationFn: () =>
      dataBatch.downloadEnhancedRecordList({ batchId: batch!.id }),
  });

  const { mutateAsync: onDownloadError } = useMutation({
    operationName: 'download record errors',
    mutationFn: () => dataBatch.downloadBatchErrorList({ batchId: batch!.id }),
  });

  const { mutateAsync: onDownloadSourceFile } = useMutation({
    operationName: 'download source file',
    mutationFn: () => dataBatch.downloadSourceFile({ batchId: batch!.id }),
  });

  const { mutateAsync: onDelete } = useMutation({
    operationName: 'delete record',
    mutationFn: () => dataBatch.deleteBatch({ batchId: batch!.id }),
    refetchQueries: [dataBatch.queryKey],
    onSuccess: () => {
      navigate({ to: parentPath });
    },
  });

  if (!batch) {
    return (
      <Button
        variant='default'
        disabled
        className='inline-flex items-center gap-2 font-semibold shadow-sm'
      >
        <span>Batch Actions</span>
        <ChevronDown className='size-4' />
      </Button>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(batch.id);
    toast.success('Copied batch number to clipboard');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='default'
          className='inline-flex items-center gap-2 font-semibold shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 transition-all duration-200 cursor-pointer bg-primary text-primary-foreground'
        >
          <span>Batch Actions</span>
          <ChevronDown className='size-4 shrink-0 transition-transform duration-200' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem onClick={handleCopy}>
          <ClipboardCopy className='size-4 text-muted-foreground mr-2' />
          Copy Batch Number
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={isReprocessDisabled}
          title={reprocessDisabledReason}
          onClick={() => reprocess(undefined)}
        >
          <RefreshCw
            className={`size-4 text-muted-foreground mr-2 ${isReprocessPending ? 'animate-spin' : ''}`}
          />
          {isReprocessPending ? 'Queuing Reprocess...' : 'Reprocess Batch'}
        </DropdownMenuItem>

        <DropdownMenuItem
          variant='primary'
          onClick={() => onDownload(undefined)}
        >
          <DownloadIcon className='size-4 mr-2' />
          Download Batch
        </DropdownMenuItem>

        <DropdownMenuItem
          variant='destructive'
          onClick={() => onDownloadError(undefined)}
        >
          <DownloadIcon className='size-4 mr-2' />
          Download Errors
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onDownloadSourceFile(undefined)}>
          <DownloadIcon className='size-4 text-muted-foreground mr-2' />
          Download Source File
        </DropdownMenuItem>

        <DropdownMenuItem
          variant='destructive'
          disabled={!canDelete}
          onClick={() => onDelete(undefined)}
        >
          <Trash2 className='size-4 mr-2' />
          Delete Batch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
