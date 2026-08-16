import { useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useBatchDelete } from '@/hooks/use-batch-delete';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { ROUTES } from '@/router';

export const useDataBatchAction = (data: TDataBatch) => {
  const { dataBatch } = useServices();
  const navigate = useNavigate();
  const batchId = useMemo(() => data.id, [data.id]);
  const { canDelete, deleteBatch } = useBatchDelete(data);

  const { mutateAsync: onDownload } = useMutation({
    operationName: 'download record',
    mutationFn: () => dataBatch.downloadEnhancedRecordList({ batchId }),
  });

  const { mutateAsync: onDownloadError } = useMutation({
    operationName: 'download record errors',
    mutationFn: () => dataBatch.downloadBatchErrorList({ batchId }),
  });

  const { mutateAsync: onDownloadSourceFile } = useMutation({
    operationName: 'download source file',
    mutationFn: () => dataBatch.downloadSourceFile({ batchId }),
  });

  const onView = useCallback(() => {
    navigate({
      to: ROUTES.DASHBOARD.CASH_OUT.BATCH.VIEW,
      params: { batchId },
    });
  }, [batchId, navigate]);

  return {
    onDownload,
    onView,
    onDownloadError,
    onDownloadSourceFile,
    onDelete: deleteBatch,
    canDelete,
  };
};
