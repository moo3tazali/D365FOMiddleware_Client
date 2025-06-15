import toast from 'react-hot-toast';
import { useRef } from 'react';
import type {
  Control,
  FieldValues,
  // Path,
} from 'react-hook-form';
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
> extends Omit<
    MutationObserverOptions<TData, unknown, TVariables>,
    'onError'
  > {
  operationName: string;
  refetchQueries?: unknown[][];
  formControl?: Control<TFieldValues>;
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
  toastMsgs,
  operationName,
  formControl,
  mutationFn,
  ...options
}: Props<TData, TVariables, TFieldValues>) => {
  const queryClient = useQueryClient();

  const loadingRef = useRef<string | null>(null);

  // capitalize operation name
  const operation =
    operationName.charAt(0).toUpperCase() +
    operationName.slice(1);

  return useTanstackMutation({
    mutationFn,
    ...options,
    onMutate: (variables) => {
      // show loading toast
      const loading = toast.loading(
        toastMsgs?.loading ?? `${operation} in progress...`
      );

      // set loading ref
      loadingRef.current = loading;

      // call onMutate
      if (onMutate) {
        onMutate(variables);
      }
    },
    onSuccess: (data, variables, context) => {
      // remove loading toast
      if (loadingRef.current) {
        toast.dismiss(loadingRef.current);
      }

      // show success toast
      toast.success(
        toastMsgs?.success ?? `${operation} success!`
      );

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
      // remove loading toast
      if (loadingRef.current) {
        toast.dismiss(loadingRef.current);
      }

      // show error toast
      toast.error(
        toastMsgs?.error ??
          error?.message ??
          `${operation} failed!`
      );

      // set form errors
      if (formControl) {
        // set root error
        formControl.setError('root', {
          type: 'manual',
          message: error.message,
        });

        // set field errors
        // if (error.validationsErrors) {
        //   Object.entries(error.validationsErrors).forEach(
        //     ([key, value]) => {
        //       formControl.setError(
        //         key as Path<TFieldValues>,
        //         {
        //           type: 'manual',
        //           message: value.join(', '),
        //         }
        //       );
        //     }
        //   );
        // }
      }

      // call onError
      if (onError) {
        onError(error, variables, context);
      }
    },
  });
};
