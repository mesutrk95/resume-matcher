import { z } from 'zod';
import { PromptKeyValidator, jsonSchemaValidator } from './common';

// Schema for a variation in the export/import format
export const aiPromptVariationExportSchema = z.object({
  id: z.string().optional(), // Optional for new variations during import
  userPrompt: z.string(),
  systemPrompt: z.string().optional(),
});

export type AIPromptVariationExport = z.infer<typeof aiPromptVariationExportSchema>;

// Schema for a prompt in the export/import format
export const aiPromptExportSchema = z.object({
  key: PromptKeyValidator,
  name: z.string(),
  description: z.string().optional(),
  jsonSchema: jsonSchemaValidator.optional(),
  category: z.string().optional(),
  variations: z.array(aiPromptVariationExportSchema),
});

export type AIPromptExport = z.infer<typeof aiPromptExportSchema>;

// Schema for export params
export const exportAIPromptSchema = z.object({
  key: PromptKeyValidator,
});

export type ExportAIPromptInput = z.infer<typeof exportAIPromptSchema>;

// Schema for import validation
export const importAIPromptSchema = z.object({
  promptJson: z.string().refine(
    val => {
      try {
        const parsed = JSON.parse(val);
        return aiPromptExportSchema.safeParse(parsed).success;
      } catch (e) {
        return false;
      }
    },
    {
      message: 'Invalid JSON format or schema. Please provide a valid export file.',
    },
  ),
});

export type ImportAIPromptInput = z.infer<typeof importAIPromptSchema>;
