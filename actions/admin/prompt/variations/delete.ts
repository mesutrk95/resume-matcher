'use server';

import { db } from '@/lib/db';
import {
  deleteAIPromptVariationSchema,
  DeleteAIPromptVariationInput,
} from '@/models/aiPromptVariation';
import { AIPromptVariationStatus } from '@prisma/client';
import {
  BadRequestException,
  InvalidInputException,
  NotFoundException,
  ForbiddenException,
} from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';

/**
 * Deletes an AIPromptVariation
 * @param data Object containing variation ID and permanent flag
 * @returns Success message
 */
export const deleteAIPromptVariation = withErrorHandling(
  async (data: DeleteAIPromptVariationInput) => {
    // Get current user
    const user = await currentAdmin();
    if (!user?.id) {
      throw new BadRequestException('You must be logged in to delete a prompt variation');
    }

    // Validate input
    const validationResult = deleteAIPromptVariationSchema.safeParse(data);
    if (!validationResult.success) {
      throw new InvalidInputException(
        validationResult.error.errors.map(x => x.message).join('\n'),
        validationResult.error.errors,
      );
    }

    const { id, permanent } = validationResult.data;

    // Get the variation to ensure it exists
    const variation = await db.aIPromptVariation.findUnique({
      where: { id },
      include: {
        prompt: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!variation) {
      throw new NotFoundException(`Prompt variation with ID "${id}" not found`);
    }

    // For permanent delete, verify the variation is in DRAFT status
    if (permanent) {
      // Allow permanent deletion if the variation is DRAFT (initial permanent delete)
      // OR if it's already DELETED (removing from deleted filter permanently)
      if (
        variation.status === AIPromptVariationStatus.DRAFT ||
        variation.status === AIPromptVariationStatus.DELETED
      ) {
        // Permanently delete the variation and its requests
        await db.aIRequest.deleteMany({
          where: { variationId: id },
        });

        await db.aIPromptVariation.delete({
          where: { id },
        });

        return {
          success: true,
          message: `Prompt variation permanently deleted`,
        };
      } else {
        // If trying to permanently delete a variation that is not DRAFT and not already DELETED (e.g. ACTIVE)
        throw new ForbiddenException(
          'Permanent deletion is only allowed for DRAFT variations or items already in the deleted filter.',
        );
      }
    } else {
      // Soft delete by updating status to DELETED
      await db.aIPromptVariation.update({
        where: { id },
        data: { status: AIPromptVariationStatus.DELETED },
      });

      return {
        success: true,
        message: `Prompt variation marked as deleted`,
      };
    }
  },
);
