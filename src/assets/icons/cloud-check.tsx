import { cn } from '@/lib/utils';

export const CloudCheck = ({
  className,
  ...props
}: React.ComponentProps<'svg'>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={24}
      height={24}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn(
        'lucide lucide-cloud-check-icon lucide-cloud-check',
        className
      )}
      {...props}
    >
      <path d='m17 15-5.5 5.5L9 18' />
      <path d='M5 17.743A7 7 0 1 1 15.71 10h1.79a4.5 4.5 0 0 1 1.5 8.742' />
    </svg>
  );
};
