import TriangleAlert from 'lucide-react/dist/esm/icons/triangle-alert';

import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
  info?: {
    componentStack: string;
  };
}

export function ErrorFallback({ error, reset, info }: ErrorFallbackProps) {
  const message = error.message;

  if (info) {
    console.error(info.componentStack);
  }

  return (
    <div
      role='alert'
      className='flex flex-col gap-2 h-full w-full items-center justify-center'
    >
      <TriangleAlert
        className='size-28 sm:size-40 text-destructive'
        strokeWidth={1}
      />
      <h1 className='text-center'>{message}</h1>
      <p className='text-center text-base md:text-lg'>
        Something went wrong. Please try again or contact support if the issue
        persists.
      </p>
      <Button
        size='lg'
        onClick={reset}
        className='w-full max-w-xs sm:max-w-sm font-bold !mt-5'
        variant='secondary'
      >
        Try again
      </Button>
    </div>
  );
}
