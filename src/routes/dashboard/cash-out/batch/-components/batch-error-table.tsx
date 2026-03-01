import { BatchErrorTable as SharedBatchErrorTable } from '@/components/batch-error-table';

export const BatchErrorTable = () => (
  <SharedBatchErrorTable routeFrom="/dashboard/cash-out/batch/$batchId/errors/" />
);
