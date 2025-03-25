import { z } from 'zod';

/**
 * Converts a Zod schema to a human-readable string representation
 */
export function zodSchemaToString(schema: z.ZodTypeAny): string {
  try {
    // For objects, describe the shape
    if (schema instanceof z.ZodObject) {
      const shape = schema._def.shape();
      const fields = Object.entries(shape)
        .map(entry => {
          const key = entry[0];
          const value = entry[1] as z.ZodTypeAny;

          const isOptional = value instanceof z.ZodOptional;
          const baseType = isOptional
            ? (value as unknown as z.ZodOptional<z.ZodTypeAny>)._def.innerType
            : value;
          const typeDescription = getTypeDescription(baseType);

          return `  "${key}"${
            isOptional ? ' (optional)' : ' (required)'
          }: ${typeDescription}`;
        })
        .join('\n');

      return `{\n${fields}\n}`;
    }

    // For arrays, describe the element type
    if (schema instanceof z.ZodArray) {
      const elementType = schema._def.type;
      const elementTypeDescription = getTypeDescription(elementType);
      return `Array of ${elementTypeDescription}`;
    }

    // For other types, provide a simple description
    return getTypeDescription(schema);
  } catch (error) {
    // If we can't parse the schema properly, provide a generic message
    return `Unknown schema type`;
  }
}

/**
 * Get a simple description of a Zod type
 */
function getTypeDescription(schema: z.ZodTypeAny): string {
  if (schema instanceof z.ZodString) {
    const constraints: string[] = [];

    // Add min length constraint if available
    const minLength = schema._def.checks?.find(
      check => check.kind === 'min',
    )?.value;
    if (minLength !== undefined) {
      constraints.push(`min length: ${minLength}`);
    }

    // Add max length constraint if available
    const maxLength = schema._def.checks?.find(
      check => check.kind === 'max',
    )?.value;
    if (maxLength !== undefined) {
      constraints.push(`max length: ${maxLength}`);
    }

    // Add regex pattern if available
    const regex = schema._def.checks?.find(
      check => check.kind === 'regex',
    )?.regex;
    if (regex) {
      constraints.push(`matches pattern: ${regex.source}`);
    }

    // Check for email
    const isEmail = schema._def.checks?.some(check => check.kind === 'email');
    if (isEmail) {
      constraints.push('valid email format');
    }

    // Check for url
    const isUrl = schema._def.checks?.some(check => check.kind === 'url');
    if (isUrl) {
      constraints.push('valid URL format');
    }

    return `string${
      constraints.length > 0 ? ` (${constraints.join(', ')})` : ''
    }`;
  }

  if (schema instanceof z.ZodNumber) {
    const constraints: string[] = [];

    // Add min constraint if available
    const min = schema._def.checks?.find(check => check.kind === 'min')?.value;
    if (min !== undefined) {
      constraints.push(`min: ${min}`);
    }

    // Add max constraint if available
    const max = schema._def.checks?.find(check => check.kind === 'max')?.value;
    if (max !== undefined) {
      constraints.push(`max: ${max}`);
    }

    // Add integer constraint if available
    const isInt = schema._def.checks?.some(check => check.kind === 'int');
    if (isInt) {
      constraints.push('integer');
    }

    return `number${
      constraints.length > 0 ? ` (${constraints.join(', ')})` : ''
    }`;
  }

  if (schema instanceof z.ZodBoolean) {
    return 'boolean';
  }

  if (schema instanceof z.ZodDate) {
    return 'date (ISO format)';
  }

  if (schema instanceof z.ZodEnum) {
    const options = schema._def.values;
    return `enum: one of [${options.map((o: any) => `"${o}"`).join(', ')}]`;
  }

  if (schema instanceof z.ZodLiteral) {
    const value = schema._def.value;
    return `literal: ${typeof value === 'string' ? `"${value}"` : value}`;
  }

  if (schema instanceof z.ZodUnion) {
    const options = schema._def.options;
    return `one of: [${options
      .map((o: z.ZodTypeAny) => getTypeDescription(o))
      .join(' | ')}]`;
  }

  if (schema instanceof z.ZodObject) {
    return 'object';
  }

  if (schema instanceof z.ZodArray) {
    const elementType = schema._def.type;
    return `array of ${getTypeDescription(elementType)}`;
  }

  if (schema instanceof z.ZodNullable) {
    const innerType = schema._def.innerType;
    return `${getTypeDescription(innerType)} or null`;
  }

  if (schema instanceof z.ZodOptional) {
    const innerType = schema._def.innerType;
    return `${getTypeDescription(innerType)} (optional)`;
  }

  if (schema instanceof z.ZodRecord) {
    const valueType = schema._def.valueType;
    return `record with values of type ${getTypeDescription(valueType)}`;
  }

  if (schema instanceof z.ZodTuple) {
    const items = schema._def.items;
    return `tuple [${items
      .map((item: z.ZodTypeAny) => getTypeDescription(item))
      .join(', ')}]`;
  }

  return 'any';
}
