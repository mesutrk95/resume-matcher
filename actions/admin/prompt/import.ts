'use server';

import { db } from '@/lib/db';
import { AIPromptStatus, AIPromptVariationStatus } from '@prisma/client';
import { BadRequestException, InvalidInputException } from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';
import {
  ImportAIPromptInput,
  importAIPromptSchema,
  AIPromptExport,
} from '@/models/aiPromptExportImport';

/**
 * Imports a prompt and its variations from a JSON string
 * @param data The JSON string containing the prompt and its variations
 * @returns The imported prompt
 */
export const importAIPrompt = withErrorHandling(async (data: ImportAIPromptInput) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to import AI prompts');
  }

  // Validate input
  const validationResult = importAIPromptSchema.safeParse(data);
  if (!validationResult.success) {
    throw new InvalidInputException(
      validationResult.error.errors.map(x => x.message).join('\n'),
      validationResult.error.errors,
    );
  }

  // Parse the JSON string
  let promptData: AIPromptExport;
  try {
    promptData = JSON.parse(validationResult.data.promptJson);
  } catch (error) {
    throw new BadRequestException('Invalid JSON format');
  }

  // Check if the prompt already exists
  const existingPrompt = await db.aIPrompt.findUnique({
    where: { key: promptData.key },
  });

  // Create or update the prompt
  const prompt = await db.aIPrompt.upsert({
    where: { key: promptData.key },
    create: {
      key: promptData.key,
      name: promptData.name,
      description: promptData.description,
      jsonSchema: promptData.jsonSchema,
      category: promptData.category,
      status: AIPromptStatus.DRAFT,
      createdBy: user.id,
    },
    update: {
      name: promptData.name,
      description: promptData.description,
      jsonSchema: promptData.jsonSchema,
      category: promptData.category,
    },
  });

  // Process variations
  if (promptData.variations && promptData.variations.length > 0) {
    for (const variationData of promptData.variations) {
      if (variationData.id) {
        // Check if the variation exists
        const existingVariation = await db.aIPromptVariation.findUnique({
          where: { id: variationData.id },
        });

        if (existingVariation) {
          // Update existing variation but preserve statistics
          await db.aIPromptVariation.update({
            where: { id: variationData.id },
            data: {
              userPrompt: variationData.userPrompt,
              systemPrompt: variationData.systemPrompt,
              // Don't update statistics fields
            },
          });
        } else {
          // Create new variation with the specified ID
          await db.aIPromptVariation.create({
            data: {
              id: variationData.id,
              userPrompt: variationData.userPrompt,
              systemPrompt: variationData.systemPrompt,
              promptId: prompt.key,
              status: AIPromptVariationStatus.DRAFT,
              createdBy: user.id,
              // Initialize statistics to zero
              requestCount: 0,
              failureCount: 0,
              totalTokens: 0,
              promptTokens: 0,
              completionTokens: 0,
              totalResponseTime: 0,
            },
          });
        }
      } else {
        // Create new variation without a specified ID
        await db.aIPromptVariation.create({
          data: {
            userPrompt: variationData.userPrompt,
            systemPrompt: variationData.systemPrompt,
            promptId: prompt.key,
            status: AIPromptVariationStatus.DRAFT,
            createdBy: user.id,
            // Initialize statistics to zero
            requestCount: 0,
            failureCount: 0,
            totalTokens: 0,
            promptTokens: 0,
            completionTokens: 0,
            totalResponseTime: 0,
          },
        });
      }
    }
  }

  // Return the imported prompt with its variations
  const importedPrompt = await db.aIPrompt.findUnique({
    where: { key: promptData.key },
    include: {
      variations: true,
    },
  });

  return importedPrompt;
});
