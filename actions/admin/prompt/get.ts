'use server';

import { db } from '@/lib/db';
import { getAIPromptParamsSchema } from '@/models/aiPrompt';
import { BadRequestException, InvalidInputException, NotFoundException } from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';

/**
 * Gets a single AI prompt by key
 * @param key The unique key of the prompt to retrieve
 * @returns The AIPrompt object with its variations
 */
export const getAIPrompt = withErrorHandling(async (key: string) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to view AI prompts');
  }

  // Validate input
  const validationResult = getAIPromptParamsSchema.safeParse({ key });
  if (!validationResult.success) {
    throw new InvalidInputException('Invalid key provided', validationResult.error.errors);
  }

  // Get the prompt with its variations
  const prompt = await db.aIPrompt.findUnique({
    where: { key: validationResult.data.key },
    include: {
      variations: {
        where: {
          status: {
            not: 'DELETED',
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  });

  if (!prompt) {
    throw new NotFoundException(`Prompt with key "${key}" not found`);
  }

  return prompt;
});
