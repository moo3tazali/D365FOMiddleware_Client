import { z } from 'zod';

const DataBatchErrorFilterSchema = z.object({
  batchId: z.string().ulid(),
});

export { DataBatchErrorFilterSchema };
