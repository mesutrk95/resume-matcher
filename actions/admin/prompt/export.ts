'use server';

import { db } from '@/lib/db';
import { BadRequestException, NotFoundException } from '@/lib/exceptions';
import { withErrorHandling } from '@/lib/with-error-handling';
import { currentAdmin } from '@/lib/auth';
import {
  AIPromptExport,
  AIPromptVariationExport,
  ExportAIPromptInput,
  exportAIPromptSchema,
} from '@/models/aiPromptExportImport';

/**
 * Exports a single prompt and its variations as a JSON file
 * @param data The prompt key to export
 * @returns A JSON string containing the prompt and its variations
 */
export const exportAIPrompt = withErrorHandling(async (data: ExportAIPromptInput) => {
  // Get current user
  const user = await currentAdmin();
  if (!user?.id) {
    throw new BadRequestException('You must be logged in to export AI prompts');
  }

  // Validate input
  const validationResult = exportAIPromptSchema.safeParse(data);
  if (!validationResult.success) {
    throw new BadRequestException('Invalid prompt key');
  }

  const { key } = validationResult.data;

  // Get the prompt with its variations
  const prompt = await db.aIPrompt.findUnique({
    where: {
      key,
    },
    include: {
      variations: true,
    },
  });

  if (!prompt) {
    throw new NotFoundException(`Prompt with key "${key}" not found`);
  }

  // Transform variations to export format
  const exportVariations: AIPromptVariationExport[] = prompt.variations.map(variation => ({
    id: variation.id,
    userPrompt: variation.userPrompt,
    systemPrompt: variation.systemPrompt || undefined,
  }));

  // Create the export object
  const exportPrompt: AIPromptExport = {
    key: prompt.key,
    name: prompt.name,
    description: prompt.description || undefined,
    jsonSchema: prompt.jsonSchema || undefined,
    category: prompt.category || undefined,
    variations: exportVariations,
  };

  return JSON.stringify(exportPrompt, null, 2);
});
