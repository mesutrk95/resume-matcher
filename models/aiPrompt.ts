import { z } from 'zod';
import { AIPromptStatus } from '@prisma/client';
import { jsonSchemaValidator, PromptKeyValidator } from './common';

export const createAIPromptSchema = z.object({
  key: PromptKeyValidator,
  name: z.string().default(''),
  description: z.string().optional(),
  jsonSchema: jsonSchemaValidator.optional(),
  category: z.string().optional(),
});

export type CreateAIPromptInput = z.infer<typeof createAIPromptSchema>;

export const getAIPromptParamsSchema = z.object({
  key: PromptKeyValidator,
});

export const getAllAIPromptsParamsSchema = z.object({
  status: z.nativeEnum(AIPromptStatus).optional(),
  category: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export type GetAllAIPromptsParams = z.infer<typeof getAllAIPromptsParamsSchema>;

export const deletePromptSchema = z.object({
  key: PromptKeyValidator,
  permanent: z.boolean().default(false),
});

export type DeletePromptInput = z.infer<typeof deletePromptSchema>;

export const updatePromptSchema = z.object({
  key: PromptKeyValidator,
  name: z.string().optional(),
  description: z.string().optional(),
  jsonSchema: jsonSchemaValidator.optional(),
  category: z.string().optional(),
  status: z.nativeEnum(AIPromptStatus).optional(),
});

export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
