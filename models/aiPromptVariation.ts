import { z } from 'zod';
import { AIPromptVariationStatus } from '@prisma/client';
import { PromptKeyValidator } from './common';

export const createAIPromptVariationSchema = z.object({
  userPrompt: z.string().min(1, 'User prompt is required'),
  systemPrompt: z.string().optional(),
  promptId: PromptKeyValidator,
});

export type CreateAIPromptVariationInput = z.infer<typeof createAIPromptVariationSchema>;

export const updateAIPromptVariationSchema = z.object({
  id: z.string().min(1, 'Variation ID is required'),
  userPrompt: z.string().optional(),
  systemPrompt: z.string().optional(),
  status: z.nativeEnum(AIPromptVariationStatus).optional(),
});

export type UpdateAIPromptVariationInput = z.infer<typeof updateAIPromptVariationSchema>;

export const deleteAIPromptVariationSchema = z.object({
  id: z.string().min(1, 'Variation ID is required'),
  permanent: z.boolean().default(false),
});

export type DeleteAIPromptVariationInput = z.infer<typeof deleteAIPromptVariationSchema>;

export const getAIPromptVariationSchema = z.object({
  id: z.string().min(1, 'Variation ID is required'),
});

export const getAllAIPromptVariationsSchema = z.object({
  promptId: PromptKeyValidator,
  status: z.nativeEnum(AIPromptVariationStatus).optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export type GetAllAIPromptVariationsParams = z.infer<typeof getAllAIPromptVariationsSchema>;
