import { useSuspenseQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import type { D365FOSetting } from '@/interfaces/d365fo-setting';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAppSettings } from '../-hooks/use-app-settings';

export const SettingsTable = () => {
  const { appSetting } = useServices();

  const { data } = useSuspenseQuery(appSetting.queryOptions());

  const { onSubmit } = useAppSettings();

  return (
    <div className='grid grid-cols-fit-400 gap-4'>
      {data?.map((setting) => (
        <SettingsCard key={setting.id} setting={setting} onChange={onSubmit} />
      ))}
    </div>
  );
};

interface SettingsCardProps {
  setting: D365FOSetting;
  onChange?: (setting: D365FOSetting & { newValue: string }) => void;
}

const SettingsCard = ({ setting, onChange }: SettingsCardProps) => {
  const [newValue, setNewValue] = useState(setting.value?.toString() || '');

  const isUpdate = setting.value !== null;
  const isSame = newValue === setting.value?.toString();
  const hasAction = setting.hasAction;

  const isBtnDisabled: boolean =
    (isUpdate && isSame) || (isUpdate && !newValue) || !hasAction;

  return (
    <Card className='p-4 flex flex-col'>
      <div className='space-y-3 flex-1'>
        <h3>{setting.displayName}</h3>

        {setting.value !== null && (
          <Input
            className='text-sm col-span-3 pe-3'
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
        )}
      </div>

      <div>
        <Button
          variant={isUpdate ? 'success' : 'default'}
          className='w-full flex max-w-xs ms-auto'
          disabled={isBtnDisabled}
          onClick={() => {
            if (!onChange) return;
            onChange({
              ...setting,
              newValue,
            });
          }}
        >
          {isUpdate ? 'Update' : 'Refresh'}
        </Button>
      </div>
    </Card>
  );
};
