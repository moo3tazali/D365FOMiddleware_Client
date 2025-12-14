import { useCallback } from 'react';

import type { D365FOSetting } from '@/interfaces/d365fo-setting';

import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';

export const useAppSettings = () => {
  const { appSetting } = useServices();

  const { mutate, setOperationName, isPending } = useMutation({
    operationName: 'update settings',
    mutationFn: appSetting.update,
    refetchQueries: [appSetting.queryKey],
  });

  const onSubmit = useCallback(
    (data: D365FOSetting & { newValue: string }) => {
      if (data.value === data.newValue) {
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
