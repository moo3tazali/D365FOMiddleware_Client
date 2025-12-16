import { useCallback } from 'react';

import type { D365FOSetting } from '@/interfaces/d365fo-setting';

import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import toast from 'react-hot-toast';

export const useAppSettings = () => {
  const { appSetting } = useServices();

  const { mutate, setOperationName, isPending } = useMutation({
    operationName: 'update settings',
    mutationFn: appSetting.update,
    refetchQueries: [appSetting.queryKey],
  });

  const onSubmit = useCallback(
    (data: D365FOSetting & { newValue: string }) => {
      if (!data.newValue) {
        return;
      }

      if (data.value === data.newValue) {
        return;
      }

      if (isNaN(Number(data.newValue))) {
        toast.error('Value must be a number');
        return;
      }

      setOperationName(`update ${data.displayName}`);

      mutate({
        logicalName: data.logicalName,
        value: data.newValue,
      });
    },
    [mutate, setOperationName]
  );

  return { onSubmit, isPending };
};
