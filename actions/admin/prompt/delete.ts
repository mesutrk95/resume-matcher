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
import { DeletePromptInput, deletePromptSchema } from '@/models/aiPrompt';

/**
 * Deletes an AIPrompt
 * @param data The prompt key and whether to permanently delete
 * @returns Success message
 */
export const deleteAIPrompt = withErrorHandling(async (data: DeletePromptInput) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to delete an AI prompt');
  }

  // Validate input
  const validationResult = deletePromptSchema.safeParse(data);
  if (!validationResult.success) {
    throw new InvalidInputException('Invalid input data', validationResult.error.errors);
  }

  const { key, permanent } = validationResult.data;

  // Get the prompt to ensure it exists
  const prompt = await db.aIPrompt.findUnique({
    where: { key },
  });

  if (!prompt) {
    throw new NotFoundException(`Prompt with key "${key}" not found`);
  }

  // For permanent delete, verify the prompt is in DRAFT status
  if (permanent) {
    if (prompt.status !== AIPromptStatus.DRAFT) {
      throw new ForbiddenException('Only prompts in DRAFT status can be permanently deleted');
    }

    // Permanently delete the prompt and its variations
    await db.aIPromptVariation.deleteMany({
      where: { promptId: key },
    });

    await db.aIPrompt.delete({
      where: { key },
    });

    return {
      success: true,
      message: `Prompt "${key}" permanently deleted`,
    };
  } else {
    await db.aIPrompt.update({
      where: { key },
      data: { status: AIPromptStatus.DELETED },
    });

    return {
      success: true,
      message: `Prompt "${key}" marked as deleted`,
    };
  }
});
