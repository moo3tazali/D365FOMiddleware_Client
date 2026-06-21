import { useNavigate } from '@tanstack/react-router';

import type { TDataBatch } from '@/interfaces/data-batch';

import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';
import { ROUTES } from '@/router';
import { useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';

export const useDataBatchAction = (data: TDataBatch) => {
  const { dataBatch } = useServices();
  const user = useAuth((state) => state.user);
  const canDelete =
    user?.role === 'ADMIN' ||
    (Boolean(user?.id) && data.createdByUserId === user?.id);

  const navigate = useNavigate();

  const batchId = useMemo(() => data.id, [data.id]);

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

  const { mutateAsync: onDelete } = useMutation({
    operationName: 'delete record',
    mutationFn: () => dataBatch.deleteBatch({ batchId }),
    refetchQueries: [dataBatch.queryKey],
  });

  const onView = useCallback(() => {
    navigate({
      to: ROUTES.DASHBOARD.CASH_IN.BATCH.VIEW,
      params: { batchId },
    });
  }, [batchId, navigate]);

  return {
    onDownload,
    onView,
    onDownloadError,
    onDownloadSourceFile,
    onDelete,
    canDelete,
  };
};
