// lib/ai/validators.ts
import { ValidationResult, Validator } from './types';
import * as z from 'zod';
import { parse as parseHtml } from 'node-html-parser';

/**
 * Simple HTML validator that just checks if the response is valid HTML
 */
export const createDefaultHtmlValidator = (): Validator<string> => {
  return (html: string): ValidationResult => {
    try {
      parseHtml(html);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors: [`Invalid HTML: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  };
};

/**
 * JSON schema validator using Zod
 * It validates that the response matches the expected schema
 */
export const createJsonSchemaValidator = <T>(schema: z.ZodType<T>): Validator<T> => {
  return (data: T): ValidationResult => {
    try {
      // Validate the data against the schema
      const result = schema.safeParse(data);

      if (!result.success) {
        // Extract error messages from Zod errors
        const errors = result.error.errors.map(err => {
          const path = err.path.join('.');
          return `${path ? path + ': ' : ''}${err.message}`;
        });

        return {
          valid: false,
          errors,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors: [
          `Schema validation error: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  };
};

/**
 * Example usage:
 *
 * // Define a Zod schema for a user
 * const userSchema = z.object({
 *   name: z.string().min(2),
 *   email: z.string().email(),
 *   age: z.number().int().positive().optional()
 * });
 *
 * // Create a validator
 * const userValidator = createJsonSchemaValidator(userSchema);
 *
 * // Create an HTML validator
 * const htmlValidator = createDefaultHtmlValidator();
 */
