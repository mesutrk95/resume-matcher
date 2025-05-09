'use server';

import { db } from '@/lib/db';
import { getAllAIPromptsParamsSchema, GetAllAIPromptsParams } from '@/models/aiPrompt';
import { BadRequestException, InvalidInputException } from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';
import { AIPromptStatus } from '@prisma/client';

/**
 * Gets all AI prompts with optional filtering and pagination
 * @param params The filter and pagination parameters
 * @returns A paginated list of AI prompts
 */
export const getAllAIPrompts = withErrorHandling(async (params: GetAllAIPromptsParams) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to view AI prompts');
  }

  // Validate input
  const validationResult = getAllAIPromptsParamsSchema.safeParse(params);
  if (!validationResult.success) {
    throw new InvalidInputException('Invalid parameters', validationResult.error.errors);
  }

  const { status, category, page = 1, limit = 20 } = validationResult.data;
  const skip = (page - 1) * limit;

  // Prepare the where clause based on filters
  const where: any = {
    // Only show non-deleted prompts by default
    status: status || { not: AIPromptStatus.DELETED },
  };

  // Add category filter if provided
  if (category) {
    where.category = category;
  }

  // Get prompts with count
  const [prompts, totalCount] = await Promise.all([
    db.aIPrompt.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        variations: {
          where: {
            status: {
              not: 'DELETED',
            },
          },
          select: {
            id: true,
            status: true,
            _count: {
              select: {
                requests: true,
              },
            },
          },
        },
        _count: {
          select: {
            variations: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    db.aIPrompt.count({ where }),
  ]);

  return {
    prompts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPreviousPage: page > 1,
    },
  };
});
