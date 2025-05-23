'use server';

import { db } from '@/lib/db';
import {
  createAIPromptVariationSchema,
  CreateAIPromptVariationInput,
} from '@/models/aiPromptVariation';
import { AIPromptStatus, AIPromptVariationStatus } from '@prisma/client';
import { BadRequestException, InvalidInputException, NotFoundException } from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';

/**
 * Creates a new AIPromptVariation
 * @param data The variation data to create
 * @returns The created AIPromptVariation
 */
export const createAIPromptVariation = withErrorHandling(
  async (data: CreateAIPromptVariationInput) => {
    // Get current user
    const user = await currentAdmin();
    if (!user?.id) {
      throw new BadRequestException('You must be logged in to create a prompt variation');
    }

    // Validate input
    const validationResult = createAIPromptVariationSchema.safeParse(data);
    if (!validationResult.success) {
      throw new InvalidInputException(
        validationResult.error.errors.map(x => x.message).join('\n'),
        validationResult.error.errors,
      );
    }

    const { promptId, userPrompt, systemPrompt } = validationResult.data;

    // Check if the parent prompt exists and is not deleted
    const prompt = await db.aIPrompt.findUnique({
      where: { key: promptId, status: { not: AIPromptStatus.DELETED } },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with key "${promptId}" not found`);
    }

    // Create the new prompt variation with DRAFT status
    const newVariation = await db.aIPromptVariation.create({
      data: {
        userPrompt,
        systemPrompt,
        promptId,
        status: AIPromptVariationStatus.DRAFT,
        createdBy: user.id,
      },
    });

    return newVariation;
  },
);
