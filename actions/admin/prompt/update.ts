'use server';

import { db } from '@/lib/db';
import { AIPromptStatus } from '@prisma/client';
import {
  BadRequestException,
  InvalidInputException,
  NotFoundException,
  ForbiddenException,
} from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';
import { UpdatePromptInput, updatePromptSchema } from '@/models/aiPrompt';

/**
 * Updates an AIPrompt
 * @param data The prompt data to update
 * @returns The updated AIPrompt
 */
export const updateAIPrompt = withErrorHandling(async (data: UpdatePromptInput) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to update an AI prompt');
  }

  // Validate input
  const validationResult = updatePromptSchema.safeParse(data);
  if (!validationResult.success) {
    throw new InvalidInputException(
      validationResult.error.errors.map(x => x.message).join('\n'),
      validationResult.error.errors,
    );
  }

  const { key, status, ...updateData } = validationResult.data;

  const prompt = await db.aIPrompt.findUnique({
    where: { key },
  });

  if (!prompt) {
    throw new NotFoundException(`Prompt with key "${key}" not found`);
  }

  if (status && status != prompt.status && status !== AIPromptStatus.ACTIVE) {
    throw new BadRequestException('Invalid status provided, must be ACTIVE only for update');
  }

  if (status) {
    if (prompt.status === AIPromptStatus.DELETED) {
      throw new ForbiddenException('Cannot update a prompt that has been deleted');
    }

    if (prompt.status !== AIPromptStatus.DRAFT && status === AIPromptStatus.ACTIVE) {
      throw new BadRequestException('Only prompts in DRAFT status can be updated to ACTIVE');
    }
  }

  // Update the prompt
  const updatedPrompt = await db.aIPrompt.update({
    where: { key },
    data: {
      ...updateData,
      ...(status && { status }),
    },
  });

  return updatedPrompt;
});
