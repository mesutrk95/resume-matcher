'use server';

import { db } from '@/lib/db';
import { currentAdmin } from '@/lib/auth';
import { GetAllAIRequestsParams, GetAllAIRequestsSchema } from '@/models/aiRequests';

export async function getAllAIRequests(params: GetAllAIRequestsParams) {
  const admin = await currentAdmin();
  if (!admin) {
    throw new Error('Unauthorized');
  }

  const validatedParams = GetAllAIRequestsSchema.parse(params);
  const { page, pageSize, status, userId, promptKey, sortBy, sortOrder } = validatedParams;

  // Calculate pagination
  const skip = (page - 1) * pageSize;

  // Build where clause based on filters
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (userId) {
    where.userId = userId;
  }

  if (promptKey) {
    where.variation = {
      prompt: {
        key: promptKey,
      },
    };
  }

  // Get total count for pagination
  const totalCount = await db.aIRequest.count({ where });

  // Get requests with pagination, filtering, and sorting
  const requests = await db.aIRequest.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: {
      [sortBy]: sortOrder,
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

  return {
    data: requests,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}
