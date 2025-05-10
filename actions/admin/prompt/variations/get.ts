'use server';

import { db } from '@/lib/db';
import { getAIPromptVariationSchema } from '@/models/aiPromptVariation';
import { BadRequestException, InvalidInputException, NotFoundException } from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';

/**
 * Gets a single AI prompt variation by ID
 * @param id The unique ID of the variation to retrieve
 * @returns The AIPromptVariation object with related data
 */
export const getAIPromptVariation = withErrorHandling(async (id: string) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to view prompt variations');
  }

  // Validate input
  const validationResult = getAIPromptVariationSchema.safeParse({ id });
  if (!validationResult.success) {
    throw new InvalidInputException('Invalid ID provided', validationResult.error.errors);
  }

  // Get the variation with its prompt info and all statistics
  const variation = await db.aIPromptVariation.findUnique({
    where: { id: validationResult.data.id },
    include: {
      prompt: {
        select: {
          key: true,
          name: true,
          status: true,
        },
      },
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
  });

  if (!variation) {
    throw new NotFoundException(`Prompt variation with ID "${id}" not found`);
  }

  return variation;
});
