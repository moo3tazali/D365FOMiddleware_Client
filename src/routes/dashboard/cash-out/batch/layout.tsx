import { createFileRoute, Outlet } from '@tanstack/react-router';

import { ErrorFallback } from '@/components/fallback/error-fallback';
import { CashOutUploadValidationProvider } from './-hooks/use-upload-validation';

export const Route = createFileRoute('/dashboard/cash-out/batch')({
  component: BatchLayoutComponent,
  errorComponent: ErrorFallback,
});

function BatchLayoutComponent() {
  return (
    <CashOutUploadValidationProvider>
      <Outlet />
    </CashOutUploadValidationProvider>
  );
}
