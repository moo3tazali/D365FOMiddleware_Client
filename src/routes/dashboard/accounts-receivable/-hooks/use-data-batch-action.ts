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

  const onView = useCallback(() => {
    navigate({
      to: ROUTES.DASHBOARD.ACCOUNTS_RECEIVABLE.BATCH.VIEW,
      params: { batchId },
    });
  }, [batchId, navigate]);

  return { onDownload, onView };
};
