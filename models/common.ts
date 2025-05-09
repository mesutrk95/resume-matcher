import { validateJsonSchema } from '@/utils/validateJsonSchema';
import { z } from 'zod';

export const PromptKeyValidator = z
  .string()
  .min(3, 'Key must be at least 3 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Key can only contain English letters, numbers, and underscores')
  .trim();

export const jsonSchemaValidator = z.string().refine(
  val => {
    if (!val || val.trim() === '') return true;
    const validateResult = validateJsonSchema(val);
    return validateResult.valid;
  },
  {
    message: 'Invalid JSON Schema format. Please provide a valid JSON Schema or leave empty.',
  },
);
