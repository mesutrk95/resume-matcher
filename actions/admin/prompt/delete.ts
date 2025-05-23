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
    throw new InvalidInputException(
      validationResult.error.errors.map(x => x.message).join('\n'),
      validationResult.error.errors,
    );
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
    // Allow permanent deletion if the prompt is DRAFT (initial permanent delete)
    // OR if it's already DELETED (removing from deleted filter permanently)
    if (prompt.status === AIPromptStatus.DRAFT || prompt.status === AIPromptStatus.DELETED) {
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
      // If trying to permanently delete a prompt that is not DRAFT and not already DELETED (e.g. ACTIVE)
      throw new ForbiddenException(
        'Permanent deletion is only allowed for DRAFT prompts or items already in the deleted filter.',
      );
    }
  } else {
    // Soft delete: mark as DELETED
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
