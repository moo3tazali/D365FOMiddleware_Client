import { useCallback, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { useParsedPagination } from '@/hooks/use-parsed-pagination';
import type { ErrorRes } from '@/interfaces/api-res';

export const useSubmitBatch = () => {
  const { dataBatch, accountReceivable } = useServices();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]> | null
  >(null);

  const batchNumber = useParams({
    from: '/dashboard/accounts-receivable/batch/$batchId',
  }).batchId;

  const defaultPagination = useParsedPagination();

  const { mutate, isPending } = useMutation({
    operationName: 'post to D365FO',
    mutationFn: (batchId: string) => accountReceivable.postToDFO(batchId),
    refetchQueries: [
      [...dataBatch.queryKey, { batchNumber }],
      [...dataBatch.getQueryKey('accountReceivable', defaultPagination)],
    ],
    toastMsgs: {
      loading: 'Posting to D365FO...',
      success: '', // Will be replaced in onSuccess
      error: 'Failed to post batch to D365FO',
    },
    onSuccess: (data) => {
      // Dismiss the default success toast and show custom one with jobId
      toast.dismiss();
      const response = data as { jobId: string; message: string };
      toast.success(`Batch queued for posting. Job ID: ${response.jobId}`, {
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
    (values: TDataBatch) => {
      mutate(values.id);
    },
    [mutate]
  );

  const closeValidationModal = useCallback(() => {
    setValidationErrors(null);
  }, []);

  return { onSubmit, isPending, validationErrors, closeValidationModal };
};
