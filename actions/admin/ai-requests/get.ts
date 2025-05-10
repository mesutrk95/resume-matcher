'use server';

import { db } from '@/lib/db';
import { currentAdmin } from '@/lib/auth';
import { z } from 'zod';

const GetAIRequestSchema = z.object({
  id: z.string(),
});

export type GetAIRequestParams = z.infer<typeof GetAIRequestSchema>;

export async function getAIRequest(params: GetAIRequestParams) {
  const admin = await currentAdmin();
  if (!admin) {
    throw new Error('Unauthorized');
  }

  const validatedParams = GetAIRequestSchema.parse(params);
  const { id } = validatedParams;

  const request = await db.aIRequest.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      variation: {
        include: {
          prompt: {
            select: {
              key: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw new Error('AI Request not found');
  }

  return request;
}
