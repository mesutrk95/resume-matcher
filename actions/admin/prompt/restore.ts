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
import { z } from 'zod';

const restorePromptSchema = z.object({
  key: z.string().min(1, 'Prompt key is required'),
});

type RestorePromptInput = z.infer<typeof restorePromptSchema>;

/**
 * Restores an AIPrompt from DELETED to DRAFT status
 * @param data The prompt key
 * @returns Success message
 */
export const restoreAIPrompt = withErrorHandling(async (data: RestorePromptInput) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to restore an AI prompt');
  }

  // Validate input
  const validationResult = restorePromptSchema.safeParse(data);
  if (!validationResult.success) {
    throw new InvalidInputException(
      validationResult.error.errors.map(x => x.message).join('\n'),
      validationResult.error.errors,
    );
  }

  const { key } = validationResult.data;

  // Get the prompt to ensure it exists
  const prompt = await db.aIPrompt.findUnique({
    where: { key },
  });

  if (!prompt) {
    throw new NotFoundException(`Prompt with key "${key}" not found`);
  }

  // Verify the prompt is in DELETED status
  if (prompt.status !== AIPromptStatus.DELETED) {
    throw new ForbiddenException('Only prompts in DELETED status can be restored.');
  }

  // Update the prompt status to DRAFT
  await db.aIPrompt.update({
    where: { key },
    data: { status: AIPromptStatus.DRAFT },
  });

  return {
    success: true,
    message: `Prompt "${key}" restored to DRAFT status.`,
  };
});
