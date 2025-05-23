import { cn } from '@/lib/utils';

interface Props extends React.ComponentProps<'p'> {
  children?: React.ReactNode;
}

export const FormErrorMessage: React.FC<Props> = ({
  className,
  children,
  ...props
}) => {
  if (!children) return null;
  return (
    <p
      data-slot='form-message'
      id='root-error-message'
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {children}
    </p>
  );
};
