import { AIRequestStatus } from '@prisma/client';
import { z } from 'zod';

export const GetAllAIRequestsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(AIRequestStatus).optional(),
  userId: z.string().optional(),
  promptKey: z.string().optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GetAllAIRequestsParams = z.infer<typeof GetAllAIRequestsSchema>;
