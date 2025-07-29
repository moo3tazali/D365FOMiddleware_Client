import { useSuspenseQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import type { D365FOSetting } from '@/interfaces/d365fo-setting';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const SettingsTable = () => {
  const { appSetting } = useServices();

  const { data } = useSuspenseQuery(appSetting.queryOptions());

  return (
    <div className='grid grid-cols-fit-400 gap-4'>
      {data?.map((setting) => (
        <SettingsCard key={setting.id} setting={setting} />
      ))}
    </div>
  );
};

interface SettingsCardProps {
  setting: D365FOSetting;
  onChange?: (setting: D365FOSetting) => void;
}

const SettingsCard = ({ setting, onChange }: SettingsCardProps) => {
  const [value, setValue] = useState(setting.value?.toString() || '');

  const isBtnDisabled =
    (setting.value && value === setting.value?.toString()) || false;

  return (
    <Card className='p-4 flex flex-col'>
      <div className='space-y-3 flex-1'>
        <h3>{setting.displayName}</h3>

        {setting.value && (
          <Input
            className='text-sm col-span-3 pe-3'
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
      </div>
      <div>
        <Button
          variant={setting.value ? 'success' : 'default'}
          className='w-full flex max-w-xs ms-auto'
          disabled={isBtnDisabled}
          onClick={() => {
            if (!onChange) return;
            onChange({
              ...setting,
              value,
            });
          }}
        >
          {setting.value ? 'Update' : 'Refresh'}
        </Button>
      </div>
    </Card>
  );
};
