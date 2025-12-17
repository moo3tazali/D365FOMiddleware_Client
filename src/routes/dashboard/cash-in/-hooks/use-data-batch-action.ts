import { useNavigate } from '@tanstack/react-router';

import type { TDataBatch } from '@/interfaces/data-batch';

import { useServices } from '@/hooks/use-services';
import { useMutation } from '@/hooks/use-mutation';
import { ROUTES } from '@/router';
import { useCallback, useMemo } from 'react';

export const useDataBatchAction = (data: TDataBatch) => {
  const { dataBatch } = useServices();

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

  return { onDownload, onView, onDownloadError, onDelete };
};
