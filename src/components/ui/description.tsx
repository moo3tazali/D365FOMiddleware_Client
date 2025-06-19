import { cn } from '@/lib/utils';

export function Description({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  if (!props?.children) return null;
  return (
    <p
      data-slot='description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}
