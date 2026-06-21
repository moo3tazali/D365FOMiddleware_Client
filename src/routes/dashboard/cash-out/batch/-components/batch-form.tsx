import CloudUpload from 'lucide-react/dist/esm/icons/cloud-upload';
import Paperclip from 'lucide-react/dist/esm/icons/paperclip';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from '@/components/ui/file-upload';
import { useBatchForm } from '../-hooks/use-batch-form';
import { Progress } from '@/components/ui/progress';
import { ENTRY_PROCESSOR_OPTIONS } from '@/constants/data-batch';
import { cn } from '@/lib/utils';

export const BatchForm = () => {
  const { form } = useBatchForm();

  return (
    <Form {...form}>
      <form onSubmit={form.onSubmit} className='space-y-5'>
        <div className='flex flex-col lg:flex-row gap-5 *:flex-1'>
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Service</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.isDisabled}
                  name='type'
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select the type of entry you want to upload' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <TargetServiceSelectItem />
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='dataFile'
          render={({ field }) => (
            <FormItem>
              <FormLabel asChild>
                <span>Upload New Batch</span>
              </FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value}
                  onValueChange={field.onChange}
                  dropzoneOptions={{
                    accept: {
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        ['.xlsx', '.xls'],
                    },
                    multiple: false,
                    maxFiles: 1,
                    maxSize: 1024 * 1024 * 250, // 250MB
                  }}
                  className='relative bg-background rounded-xl'
                  disabled={form.isDisabled}
                >
                  <FileInput id='dataFile'>
                    <DropZoneContent isDisabled={form.isDisabled} />
                  </FileInput>
                  <FileUploaderContent>
                    {field.value &&
                      field.value.length > 0 &&
                      field.value.map((file, i) => (
                        <FileUploaderItem index={i} key={i}>
                          <div className='flex items-center gap-2'>
                            <div className='flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10'>
                              <Paperclip className='size-3.5 text-primary' />
                            </div>
                            <div className='min-w-0 flex-1 space-y-1.5'>
                              <span className='block max-w-xs truncate text-sm font-medium sm:max-w-full'>
                                {file.name}
                              </span>
                              <Progress
                                size='xs'
                                progress={form.uploadProgress}
                              />
                            </div>
                          </div>
                        </FileUploaderItem>
                      ))}
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type='submit'
          id='upload_entries_btn'
          className='hidden absolute'
          aria-disabled={form.isDisabled}
        />
      </form>
    </Form>
  );
};

const DropZoneContent = ({ isDisabled }: { isDisabled: boolean }) => (
  <div
    className={cn(
      'group flex flex-col items-center justify-center gap-3 rounded-xl',
      'border-2 border-dashed border-border',
      'bg-muted/30 px-6 py-10',
      'transition-colors duration-200',
      !isDisabled && 'hover:border-primary/50 hover:bg-primary/5',
      isDisabled && 'opacity-50',
    )}
  >
    {/* Icon container */}
    <div
      className={cn(
        'flex size-14 items-center justify-center rounded-2xl',
        'bg-primary/10 ring-4 ring-primary/5',
        'transition-transform duration-200',
        !isDisabled && 'group-hover:scale-105',
      )}
    >
      <CloudUpload
        className={cn(
          'size-7 text-primary/70 transition-colors duration-200',
          !isDisabled && 'group-hover:text-primary',
        )}
      />
    </div>

    {/* Copy */}
    <div className='space-y-1 text-center'>
      <p className='text-sm font-semibold text-foreground'>
        <span className='text-primary'>Click to select</span> or drag & drop
      </p>
      <p className='flex items-center justify-center gap-1 text-xs text-muted-foreground'>
        <FileSpreadsheet className='size-3.5' />
        .xlsx or .xls â€” up to 250 MB
      </p>
    </div>
  </div>
);

const TargetServiceSelectItem = () =>
  ENTRY_PROCESSOR_OPTIONS.CASH_OUT.map(({ label, value }) => (
    <SelectItem key={value} value={String(value)}>
      {label}
    </SelectItem>
  ));
