'use server';

import { db } from '@/lib/db';
import {
  updateAIPromptVariationSchema,
  UpdateAIPromptVariationInput,
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
 * Updates an existing AIPromptVariation
 * @param data The variation data to update
 * @returns The updated AIPromptVariation
 */
export const updateAIPromptVariation = withErrorHandling(
  async (data: UpdateAIPromptVariationInput) => {
    // Get current user
    const user = await currentAdmin();
    if (!user?.id) {
      throw new BadRequestException('You must be logged in to update a prompt variation');
    }

    // Validate input
    const validationResult = updateAIPromptVariationSchema.safeParse(data);
    if (!validationResult.success) {
      throw new InvalidInputException(
        validationResult.error.errors.map(x => x.message).join('\n'),
        validationResult.error.errors,
      );
    }

    const { id, status, ...updateData } = validationResult.data;

    // Get the variation to ensure it exists and check current status
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

    // Check if parent prompt is deleted
    if (variation.prompt.status === 'DELETED') {
      throw new ForbiddenException('Cannot update a variation of a deleted prompt');
    }

    // Handle status transitions if status is being updated
    if (status && status !== variation.status) {
      // Cannot update a deleted variation
      if (variation.status === AIPromptVariationStatus.DELETED) {
        throw new ForbiddenException('Cannot update a variation that has been deleted');
      }

      // Status transition rules
      switch (variation.status) {
        case AIPromptVariationStatus.DRAFT:
          // Draft can only transition to Active
          if (status !== AIPromptVariationStatus.DRAFT) {
            throw new BadRequestException('Draft variations can only be changed to Active status');
          }
          break;

        case AIPromptVariationStatus.ACTIVE:
          // Active can only transition to Inactive
          if (status !== AIPromptVariationStatus.INACTIVE) {
            throw new BadRequestException(
              'Active variations can only be changed to Inactive status',
            );
          }
          break;

        case AIPromptVariationStatus.INACTIVE:
          // Inactive can only transition to Active
          if (status !== AIPromptVariationStatus.ACTIVE) {
            throw new BadRequestException(
              'Inactive variations can only be changed to Active status',
            );
          }
          break;
      }
    }

    // Update the variation
    const updatedVariation = await db.aIPromptVariation.update({
      where: { id },
      data: {
        ...updateData,
        ...(status && { status }),
      },
    });

    return updatedVariation;
  },
);
