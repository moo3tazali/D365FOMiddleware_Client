import { Rocket, Upload } from 'lucide-react';
import { useIsMutating } from '@tanstack/react-query';

import type { TDataBatch } from '@/interfaces/data-batch';
import { Button } from '@/components/ui/button';
import { useBatchStore } from '../-hooks/use-batch-store';
import { useServices } from '@/hooks/use-services';

export const BatchFooter = () => {
  const response = useBatchStore((s) => s.dataBatch);

  const ActionBtn = (() => {
    if (!response) return <UploadBtn />;

    if (response && response.errorCount) return <UploadBtn />;

    return <SubmitBtn data={response} />;
  })();

  return ActionBtn;
};

const UploadBtn = () => {
  const { accountReceivable } = useServices();

  const isUploading = useIsMutating({
    mutationKey: [accountReceivable.mutationKey],
  });

  return (
    <Button
      size='lg'
      className='w-full flex sm:max-w-xs ms-auto'
      onClick={() => {
        document.getElementById('upload_entries_btn')?.click();
      }}
      disabled={isUploading > 0}
    >
      <Upload className='size-5' />
      Upload
    </Button>
  );
};

const SubmitBtn = ({ data }: { data: TDataBatch }) => {
  return (
    <Button
      size='lg'
      className='w-full flex sm:max-w-xs ms-auto'
      disabled={false}
      onClick={() => {
        console.log(data);
      }}
    >
      <Rocket className='size-5' />
      Submit
    </Button>
  );
};
