import { TriangleAlert } from 'lucide-react';

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
      className='w-full pt-20 flex flex-col justify-center items-center gap-7'
    >
      <TriangleAlert className='text-red-500 size-28 sm:size-40' />
      <p className='text-red-600 text-sm md:text-xl'>{message}</p>
      <Button size='lg' onClick={reset} className='w-full max-w-sm font-bold'>
        Try again
      </Button>
    </div>
  );
}
