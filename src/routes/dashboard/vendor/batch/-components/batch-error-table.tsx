import { BatchErrorTable as SharedBatchErrorTable } from '@/components/batch-error-table';

export const BatchErrorTable = () => (
  <SharedBatchErrorTable routeFrom='/dashboard/vendor/batch/$batchId/errors/' />
);
