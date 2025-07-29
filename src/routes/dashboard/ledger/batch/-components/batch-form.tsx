import CloudUpload from 'lucide-react/dist/esm/icons/cloud-upload';
import Paperclip from 'lucide-react/dist/esm/icons/paperclip';

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
import { ENTRY_PROCESSOR_OPTIONS } from '@/constants/daya-batch';

export const BatchForm = () => {
  const { form } = useBatchForm();

  return (
    <Form {...form}>
      <form onSubmit={form.onSubmit} className='space-y-5'>
        <div className='max-w-xl'>
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
                  className='relative bg-background rounded-lg p-2'
                  disabled={form.isDisabled}
                >
                  <FileInput
                    id='dataFile'
                    className='outline-dashed outline-1 outline-slate-500'
                  >
                    <div className='flex items-center justify-center flex-col p-8 w-full '>
                      <CloudUpload className='text-gray-500 w-10 h-10' />
                      <p className='mb-1 text-sm text-gray-500 dark:text-gray-400'>
                        <span className='font-semibold'>
                          Click to select file
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        .xlsx or .xls files only
                      </p>
                    </div>
                  </FileInput>
                  <FileUploaderContent>
                    {field.value &&
                      field.value.length > 0 &&
                      field.value.map((file, i) => (
                        <FileUploaderItem index={i} key={i}>
                          <div className='flex items-center gap-1.5'>
                            <Paperclip className='size-4 stroke-current' />
                            <span className='block max-w-xs truncate sm:max-w-full'>
                              {file.name}
                            </span>
                          </div>
                          <Progress size='xs' progress={form.uploadProgress} />
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

const TargetServiceSelectItem = () =>
  ENTRY_PROCESSOR_OPTIONS.LEDGER.map(({ label, value }) => (
    <SelectItem key={value} value={String(value)}>
      {label}
    </SelectItem>
  ));
