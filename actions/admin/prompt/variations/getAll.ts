'use server';

import { db } from '@/lib/db';
import {
  getAllAIPromptVariationsSchema,
  GetAllAIPromptVariationsParams,
} from '@/models/aiPromptVariation';
import { AIPromptVariationStatus } from '@prisma/client';
import { InvalidInputException, BadRequestException, NotFoundException } from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentUser } from '@/lib/auth';

/**
 * Gets all variations for a specific AI prompt with optional filtering and pagination
 * @param params Object containing promptId and optional filters
 * @returns A paginated list of AI prompt variations
 */
export const getAllAIPromptVariations = withErrorHandling(
  async (params: GetAllAIPromptVariationsParams) => {
    // Get current user
    const user = await currentUser();
    if (!user?.id) {
      throw new BadRequestException('You must be logged in to view prompt variations');
    }

    // Validate input
    const validationResult = getAllAIPromptVariationsSchema.safeParse(params);
    if (!validationResult.success) {
      throw new InvalidInputException('Invalid parameters', validationResult.error.errors);
    }

    const { promptId, status, page = 1, limit = 20 } = validationResult.data;
    const skip = (page - 1) * limit;

    // Check if the parent prompt exists
    const prompt = await db.aIPrompt.findUnique({
      where: { key: promptId, status: { not: AIPromptVariationStatus.DELETED } },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with key "${promptId}" not found`);
    }

    // Prepare the where clause based on filters
    const where: any = {
      promptId,
    };

    // Add status filter if provided, otherwise exclude DELETED
    if (status) {
      where.status = status;
    } else {
      where.status = { not: AIPromptVariationStatus.DELETED };
    }

    // Get variations with count
    const [variations, totalCount] = await Promise.all([
      db.aIPromptVariation.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              requests: true,
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
      db.aIPromptVariation.count({ where }),
    ]);

    return {
      variations,
      promptInfo: {
        key: prompt.key,
        name: prompt.name,
        status: prompt.status,
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1,
      },
    };
  },
);
