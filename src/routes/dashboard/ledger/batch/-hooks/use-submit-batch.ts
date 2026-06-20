import { useCallback, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import { useInvalidate } from '@/hooks/use-invalidate';
import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { useParsedPagination } from '@/hooks/use-parsed-pagination';
import type { ErrorRes } from '@/interfaces/api-res';

export const useSubmitBatch = () => {
  const { refetch } = useInvalidate();
  const { dataBatch, ledger } = useServices();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]> | null
  >(null);

  const batchNumber = useParams({
    from: '/dashboard/ledger/batch/$batchId',
  }).batchId;

  const defaultPagination = useParsedPagination();

  const { mutate, isPending } = useMutation({
    operationName: 'post to D365FO',
    mutationFn: (batchId: string) => ledger.postToDFO(batchId),
    refetchQueries: [
      [...dataBatch.queryKey, { batchNumber }],
      [...dataBatch.getQueryKey('ledger', defaultPagination)],
    ],
    toastMsgs: {
      loading: 'Posting to D365FO...',
      success: '', // Will be replaced in onSuccess
      error: 'Failed to post batch to D365FO',
    },
    onSuccess: (submissionResult) => {
      refetch(dataBatch.queryKey);
      toast.dismiss();
      const submitResponse = submissionResult as { jobId: string; message: string };
      toast.success(submitResponse.message, {
        duration: 5000,
      });
    },
    onError: (error: ErrorRes) => {
      if (error.code === 400 && error.validationErrors) {
        setValidationErrors(error.validationErrors);
      }
    },
  });

  const onSubmit = useCallback(
    (batch: TDataBatch) => {
      mutate(batch.id);
    },
    [mutate]
  );

  const closeValidationModal = useCallback(() => {
    setValidationErrors(null);
  }, []);

  return { onSubmit, isPending, validationErrors, closeValidationModal };
};
