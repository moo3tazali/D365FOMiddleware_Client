import { cn } from '@/lib/utils';

export const Frame = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot='aspect-video-frame'
      className={cn(
        'aspect-video rounded-xl bg-muted/50 flex items-center justify-center gap-1.5 font-medium hover:bg-muted/70 p-5',
        className
      )}
      {...props}
    />
  );
};
