import { useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import type { D365FOSetting } from '@/interfaces/d365fo-setting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSettings } from '../-hooks/use-app-settings';

export const SettingsTable = () => {
  const { appSetting } = useServices();

  const { data } = useSuspenseQuery(appSetting.queryOptions());

  const formattedData = useMemo(() => {
    if (!data) return { update: [], refresh: [] };

    return data.reduce(
      (acc, item) => {
        if (item.value !== null) {
          acc.update.push(item);
        } else {
          acc.refresh.push(item);
        }
        return acc;
      },
      { update: [] as D365FOSetting[], refresh: [] as D365FOSetting[] }
    );
  }, [data]);

  return (
    <div className='space-y-10'>
      {/* Refresh Section */}
      <section className='space-y-3'>
        <h2>Refresh Settings</h2>
        <div className='space-y-3'>
          {formattedData.refresh.map((setting) => (
            <SettingsRow key={setting.id} setting={setting} />
          ))}
        </div>
      </section>

      <hr />

      {/* Update Section */}
      <section className='space-y-3'>
        <h2>Update Settings</h2>
        <div className='space-y-3'>
          {formattedData.update.map((setting) => (
            <SettingsRow key={setting.id} setting={setting} />
          ))}
        </div>
      </section>
    </div>
  );
};

interface SettingsRowProps {
  setting: D365FOSetting;
}

const SettingsRow = ({ setting }: SettingsRowProps) => {
  const [newValue, setNewValue] = useState(setting.value?.toString() || '');

  const { onSubmit, isPending } = useAppSettings();

  const isUpdate = setting.value !== null;
  const isSame = newValue === setting.value?.toString();
  const hasAction = setting.hasAction;

  const isBtnDisabled = (isUpdate && isSame) || !newValue;

  return isUpdate ? (
    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
      <label
        htmlFor={setting.id}
        className='w-80 font-medium text-sm sm:text-base'
      >
        {setting.displayName}
      </label>
      <div className='relative w-full sm:w-fit'>
        <Input
          id={setting.id}
          className='w-full sm:w-60 pe-20'
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          readOnly={!hasAction}
          disabled={isPending}
        />
        {hasAction && (
          <Button
            className='absolute right-0 top-0'
            variant='ghost'
            onClick={() =>
              onSubmit({
                ...setting,
                newValue,
              })
            }
            disabled={isBtnDisabled || isPending}
          >
            Update
          </Button>
        )}
      </div>
    </div>
  ) : (
    <div className='flex items-center gap-3'>
      <div className='w-80 font-medium text-sm sm:text-base'>
        {setting.displayName}
      </div>
      <div className='w-full sm:w-60'>
        <Button
          className='block ms-auto'
          variant='outline'
          onClick={() =>
            onSubmit({
              ...setting,
              newValue: '',
            })
          }
          disabled={!hasAction || isPending}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};
