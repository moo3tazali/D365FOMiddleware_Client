import { cn } from '@/lib/utils';

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
import { PasswordInput } from '@/components/ui/password-input';
import { FormErrorMessage } from '@/components/ui/form-error-message';
import { useLogin } from '../-hooks/use-login';
import { Link } from '@tanstack/react-router';
import { ROUTES } from '@/router';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const { form } = useLogin();

  return (
    <Form {...form}>
      <form
        {...props}
        onSubmit={form.onSubmit}
        className={cn('flex flex-col gap-5', className)}
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

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center gap-3 justify-between'>
                <FormLabel>Password</FormLabel>
                <Button
                  variant='link'
                  asChild
                  className='p-0 text-sm m-0 h-auto'
                  type='button'
                  disabled={form.isPending}
                >
                  <Link to={ROUTES.AUTH.FORGET_PW}>Forgot your password?</Link>
                </Button>
              </div>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder='********'
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

        <Button type='submit' className='w-full' disabled={form.isPending}>
          {form.isPending ? 'Loading...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
