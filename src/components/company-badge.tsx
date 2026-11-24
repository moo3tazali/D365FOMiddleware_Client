import { getCompanyLabel } from '@/constants/company';
import { cn } from '@/lib/utils';

/** Shows the company a saved batch belongs to. Read-only; never changes the batch. */
export const CompanyBadge = ({
  company,
  className,
}: {
  company: string | null | undefined;
  className?: string;
}) => (
  <span
    data-testid='company-badge'
    className={cn(
      'inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary',
      className,
    )}
  >
    Company: {getCompanyLabel(company)}
  </span>
);
