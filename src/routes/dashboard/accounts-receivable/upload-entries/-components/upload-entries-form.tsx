import { CloudUpload, Paperclip, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { useUploadEnteries } from '../-hooks/use-upload-enteries';

export const UploadEntriesForm = () => {
  const { form, UPLOAD_TYPES } = useUploadEnteries();

  return (
    <Form {...form}>
      <form onSubmit={form.onSubmit} className='space-y-5'>
        <div className='flex flex-col lg:flex-row gap-5 *:flex-1'>
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.isPending}
                  name='type'
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select the type of entry you want to upload' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={String(UPLOAD_TYPES.FREIGHT_DOC)}>
                      Freight
                    </SelectItem>
                    <SelectItem value={String(UPLOAD_TYPES.TRUCKING_DOC)}>
                      Trucking
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='billingCodeId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Service</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.isPending}
                  name='billingCodeId'
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select the target service billing classification in dynamics' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='INV-FW'>Invoices</SelectItem>
                    <SelectItem value='OR-FW'>Official Receipts</SelectItem>
                    <SelectItem value='OF-FW'>Ocean Freight</SelectItem>
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
              <FormLabel htmlFor='dataFile'>Select File</FormLabel>
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
                    maxSize: 1024 * 1024 * 10, // 10MB
                  }}
                  className='relative bg-background rounded-lg p-2'
                  disabled={form.isPending}
                >
                  <FileInput
                    id='dataFile'
                    className='outline-dashed outline-1 outline-slate-500'
                  >
                    <div className='flex items-center justify-center flex-col p-8 w-full '>
                      <CloudUpload className='text-gray-500 w-10 h-10' />
                      <p className='mb-1 text-sm text-gray-500 dark:text-gray-400'>
                        <span className='font-semibold'>Click to upload</span>
                        &nbsp; or drag and drop
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
                        <FileUploaderItem key={i} index={i}>
                          <Paperclip className='h-4 w-4 stroke-current' />
                          <span>{file.name}</span>
                        </FileUploaderItem>
                      ))}
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          size='lg'
          className='w-full flex sm:max-w-xs ms-auto'
          disabled={form.isPending}
        >
          <Upload className='size-5' />
          Upload
        </Button>
      </form>
    </Form>
  );
};
