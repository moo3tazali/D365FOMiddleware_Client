import toast from 'react-hot-toast';
import { useCallback, useRef } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import {
  useQueryClient,
  useMutation as useTanstackMutation,
  type MutationObserverOptions,
  type MutationFunction,
} from '@tanstack/react-query';

import type { ErrorRes } from '@/interfaces/api-res';

interface Props<
  TData = unknown,
  TVariables = unknown,
  TFieldValues extends FieldValues = FieldValues
> extends Omit<MutationObserverOptions<TData, unknown, TVariables>, 'onError'> {
  operationName: string;
  refetchQueries?: unknown[][];
  formControl?: Control<TFieldValues>;
  disableToast?: boolean;
  toastMsgs?: {
    loading?: string;
    success?: string;
    error?: string;
  };
  mutationFn: MutationFunction<TData, TVariables>;
  onError?: (
    error: ErrorRes,
    variables: TVariables,
    context: unknown
  ) => Promise<unknown> | unknown;
}

export const useMutation = <
  TData = unknown,
  TVariables = unknown,
  TFieldValues extends FieldValues = FieldValues
>({
  onSuccess,
  onMutate,
  onError,
  refetchQueries,
  disableToast = false,
  toastMsgs,
  operationName,
  formControl,
  mutationFn,
  ...options
}: Props<TData, TVariables, TFieldValues>) => {
  const queryClient = useQueryClient();

  const loadingRef = useRef<string | null>(null);

  const operation = useRef(operationName);

  const dismissLoading = useCallback((newLoadingId: string) => {
    if (loadingRef.current) {
      toast.dismiss(loadingRef.current);
    }
    loadingRef.current = newLoadingId;
  }, []);

  const setOperationName = useCallback((operationName: string) => {
    operation.current = operationName;
  }, []);

  return {
    ...useTanstackMutation({
      mutationFn,
      ...options,
      onMutate: (variables) => {
        if (!disableToast) {
          // show loading toast
          const loading = toast.loading(
            toastMsgs?.loading ?? `${operation.current} in progress...`
          );

          // set loading ref
          loadingRef.current = loading;
        }

        // call onMutate
        if (onMutate) {
          onMutate(variables);
        }
      },
      onSuccess: (data, variables, context) => {
        if (!disableToast) {
          // remove loading toast
          if (loadingRef.current) {
            toast.dismiss(loadingRef.current);
          }

          // show success toast
          toast.success(toastMsgs?.success ?? `${operation.current} success!`);
        }

        // refetch queries
        if (refetchQueries) {
          refetchQueries.forEach((queryKey) => {
            queryClient.refetchQueries({ queryKey });
          });
        }

        // call onSuccess
        if (onSuccess) {
          onSuccess(data, variables, context);
        }
      },
      onError: (error: ErrorRes, variables, context) => {
        if (!disableToast) {
          // remove loading toast
          if (loadingRef.current) {
            toast.dismiss(loadingRef.current);
          }

          // show error toast
          toast.error(
            toastMsgs?.error ?? error?.message ?? `${operation.current} failed!`
          );
        }

        // set form errors
        if (formControl) {
          // set root error
          formControl.setError('root', {
            type: 'manual',
            message: error.message,
          });

          // set field errors
          const validationErrors = error?.validationErrors;
          if (
            validationErrors &&
            typeof validationErrors === 'object' &&
            Object.keys(validationErrors).length > 0
          ) {
            Object.entries(validationErrors).forEach(([key, value]) => {
              if (!value) return;

              let message = '';

              if (Array.isArray(value)) {
                message = value.join(', ');
              } else if (typeof value === 'string') {
                message = value;
              } else {
                message = JSON.stringify(value);
              }

              formControl.setError(key as Path<TFieldValues>, {
                type: 'manual',
                message,
              });
            });
          }
        }

        // call onError
        if (onError) {
          onError(error, variables, context);
        }
      },
    }),
    dismissLoading,
    setOperationName,
  };
};
