import { z } from 'zod';

const DataBatchFilterSchema = z.object({
  batchNumber: z.string().optional(),
  entryProcessorType: z.string().optional(),
});

export { DataBatchFilterSchema };
