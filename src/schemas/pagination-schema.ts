import { z } from 'zod';

export const PaginationSchema = z.object({
  maxCount: z.number().optional(),
  skipCount: z.number().optional(),
});
