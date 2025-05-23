'use server';

import { db } from '@/lib/db';
import { AIPromptVariationStatus } from '@prisma/client';
import {
  BadRequestException,
  InvalidInputException,
  NotFoundException,
  ForbiddenException,
} from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';
import { z } from 'zod';

const restoreVariationSchema = z.object({
  id: z.string().min(1, 'Variation ID is required'),
});

type RestoreVariationInput = z.infer<typeof restoreVariationSchema>;

/**
 * Restores an AIPromptVariation from DELETED to DRAFT status
 * @param data The variation ID
 * @returns Success message
 */
export const restoreAIPromptVariation = withErrorHandling(async (data: RestoreVariationInput) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to restore a prompt variation');
  }

  // Validate input
  const validationResult = restoreVariationSchema.safeParse(data);
  if (!validationResult.success) {
    throw new InvalidInputException(
      validationResult.error.errors.map(x => x.message).join('\n'),
      validationResult.error.errors,
    );
  }

  const { id } = validationResult.data;

  // Get the variation to ensure it exists
  const variation = await db.aIPromptVariation.findUnique({
    where: { id },
  });

  if (!variation) {
    throw new NotFoundException(`Prompt variation with ID "${id}" not found`);
  }

  // Verify the variation is in DELETED status
  if (variation.status !== AIPromptVariationStatus.DELETED) {
    throw new ForbiddenException('Only variations in DELETED status can be restored.');
  }

  // Update the variation status to DRAFT
  await db.aIPromptVariation.update({
    where: { id },
    data: { status: AIPromptVariationStatus.DRAFT },
  });

  return {
    success: true,
    message: `Prompt variation "${id}" restored to DRAFT status.`,
  };
});
