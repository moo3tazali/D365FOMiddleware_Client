import { useCallback } from 'react';

import type { D365FOSetting } from '@/interfaces/d365fo-setting';

import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';

export const useAppSettings = () => {
  const { appSetting } = useServices();

  const { mutate, setOperationName } = useMutation({
    operationName: 'update settings',
    mutationFn: appSetting.update,
    refetchQueries: [appSetting.queryKey],
  });

  const onSubmit = useCallback(
    (data: D365FOSetting & { newValue: string }) => {
      if (data.value === data.newValue) {
        return;
      }

      const isUpdate = data.value !== null;

      setOperationName(
        isUpdate ? `update ${data.displayName}` : `refresh ${data.displayName}`
      );

      mutate({
        id: data.id,
        logicalName: data.logicalName,
        newValue: isUpdate ? data.newValue : undefined,
      });
    },
    [mutate, setOperationName]
  );

  return { onSubmit };
};
