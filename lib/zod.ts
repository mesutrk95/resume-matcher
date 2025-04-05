import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Converts a Zod schema to a human-readable string representation
 */
export function zodSchemaToString(schema: z.ZodTypeAny): string {
  return JSON.stringify(zodToJsonSchema(schema, 'schema'), null, 2);
}
