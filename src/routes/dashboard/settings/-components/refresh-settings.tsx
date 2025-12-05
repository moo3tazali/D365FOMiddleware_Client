import { useServices } from '@/hooks/use-services';
import { Button } from '@/components/ui/button';
import { useMutation } from '@/hooks/use-mutation';
import type {
  MasterDataDisplayName,
  MasterDataPayload,
} from '@/services/api/master-data';

export const RefreshSettings = () => {
  const { masterData } = useServices();

  return (
    <section className='space-y-3'>
      <h2>Refresh Settings</h2>
      <div className='space-y-3'>
        {masterData.displayNames.map((name, idx) => (
          <SettingsRow key={idx} name={name} onRefresh={masterData.sync} />
        ))}
      </div>
    </section>
  );
};

interface RefreshSettingsRowProps {
  name: MasterDataDisplayName;
  onRefresh: (
    name: MasterDataDisplayName,
    payload: MasterDataPayload
  ) => Promise<void>;
}

const SettingsRow = ({ name, onRefresh }: RefreshSettingsRowProps) => {
  const mutationFn = async () => {
    onRefresh(name, {
      company: 'm-p',
      chartOfAccounts: '',
      rateType: '',
    });
  };

  const { mutate, isPending } = useMutation({
    operationName: `Refresh ${name}`,
    mutationFn,
  });

  return (
    <div className='flex items-center gap-3'>
      <div className='w-80 font-medium text-sm sm:text-base'>{name}</div>
      <div className='w-full sm:w-60'>
        <Button
          className='block ms-auto'
          variant='outline'
          onClick={mutate}
          disabled={isPending}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};
