import { Suspense, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useServices } from '@/hooks/use-services';
import type { D365FOSetting } from '@/interfaces/d365fo-setting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSettings } from '../-hooks/use-app-settings';
import { Skeleton } from '@/components/ui/skeleton';

export const SettingsForm = () => {
  return (
    <section className='space-y-3'>
      <h2>Update Settings</h2>
      <Suspense fallback={<SettingsFormSkeleton />}>
        <SettingsRows />
      </Suspense>
    </section>
  );
};

const SettingsRows = () => {
  const { appSetting } = useServices();

  const { data } = useSuspenseQuery(appSetting.listQueryOptions());

  return (
    <div className='space-y-3'>
      {data.map((setting) => (
        <SettingsRow key={setting.id} setting={setting} />
      ))}
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

  return (
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
          type='number'
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
  );
};

const SettingsFormSkeleton = () => {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className='flex flex-col sm:flex-row items-start sm:items-center gap-3'
        >
          <Skeleton className='w-80 h-5' />
          <div className='relative w-full sm:w-fit'>
            <Skeleton className='w-full sm:w-60 h-10' />
          </div>
        </div>
      ))}
    </div>
  );
};
