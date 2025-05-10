'use server';

import { db } from '@/lib/db';
import { createAIPromptSchema, CreateAIPromptInput } from '@/models/aiPrompt';
import { AIPromptStatus } from '@prisma/client';
import { InvalidInputException, BadRequestException, ConflictException } from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';
import { PROMPT_KEY_VALIDATION_REGEX } from '@/utils/prompt-key-validator';

/**
 * Creates a new AIPrompt
 * @param data The prompt data to create
 * @returns The created AIPrompt
 */
export const createAIPrompt = withErrorHandling(async (data: CreateAIPromptInput) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to create an AI prompt');
  }

  const validationResult = createAIPromptSchema.safeParse(data);
  if (!validationResult.success) {
    throw new InvalidInputException(
      validationResult.error.errors.map(x => x.message).join('\n'),
      validationResult.error.errors,
    );
  }

  const { key } = validationResult.data;
  if (!PROMPT_KEY_VALIDATION_REGEX.test(key)) {
    throw new BadRequestException(
      'Invalid key format. Key must be alphanumeric and can include underscores and dashes.',
    );
  }

  const existingPrompt = await db.aIPrompt.findUnique({
    where: { key: validationResult.data.key },
  });

  if (existingPrompt) {
    throw new ConflictException(`A prompt with key "${validationResult.data.key}" already exists`);
  }

  // Create the new prompt with DRAFT status
  const newPrompt = await db.aIPrompt.create({
    data: {
      ...validationResult.data,
      status: AIPromptStatus.DRAFT,
      createdBy: user.id,
    },
  });

  return newPrompt;
});
