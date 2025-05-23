import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormErrorMessage } from '@/components/ui/form-error-message';
import { useResetPw } from '../-hooks/use-rest-pw';

export function ForgetPwForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const { form } = useResetPw();

  return (
    <div
      className={cn(
        'flex flex-col gap-6 w-full max-w-md',
        className
      )}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your email to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.onSubmit}
              className='flex flex-col gap-5'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='user@example.com'
                        disabled={form.isPending}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormErrorMessage>
                {form.formState.errors.root?.message}
              </FormErrorMessage>

              <Button
                type='submit'
                className='w-full'
                disabled={form.isPending}
              >
                {form.isPending ? 'Loading...' : 'Send'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
