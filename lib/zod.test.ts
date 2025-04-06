import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { zodSchemaToString } from './zod';

describe('zodSchemaToString', () => {
  it('should convert a simple Zod schema to a JSON schema string', () => {
    // Create a simple Zod schema
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string().email(),
      isActive: z.boolean().optional(),
    });

    // Convert the schema to a string
    const result = zodSchemaToString(schema);

    // Verify the result is a string
    expect(typeof result).toBe('string');

    // Parse the result back to an object to verify its structure
    const parsedResult = JSON.parse(result);

    // Verify the schema structure
    expect(parsedResult).toHaveProperty(
      '$schema',
      'http://json-schema.org/draft-07/schema#',
    );
    expect(parsedResult).toHaveProperty('$ref', '#/definitions/schema');
    expect(parsedResult).toHaveProperty('definitions');
    expect(parsedResult.definitions).toHaveProperty('schema');

    // Get the actual schema from definitions
    const schemaDefinition = parsedResult.definitions.schema;

    // Verify the schema definition structure
    expect(schemaDefinition).toHaveProperty('type', 'object');
    expect(schemaDefinition).toHaveProperty('properties');
    expect(schemaDefinition).toHaveProperty('additionalProperties', false);

    // Verify the properties
    expect(schemaDefinition.properties).toHaveProperty('name');
    expect(schemaDefinition.properties).toHaveProperty('age');
    expect(schemaDefinition.properties).toHaveProperty('email');
    expect(schemaDefinition.properties).toHaveProperty('isActive');

    // Verify property types
    expect(schemaDefinition.properties.name.type).toBe('string');
    expect(schemaDefinition.properties.age.type).toBe('number');
    expect(schemaDefinition.properties.email.type).toBe('string');
    expect(schemaDefinition.properties.email.format).toBe('email');
    expect(schemaDefinition.properties.isActive.type).toBe('boolean');

    // Verify required fields
    expect(schemaDefinition).toHaveProperty('required');
    expect(schemaDefinition.required).toContain('name');
    expect(schemaDefinition.required).toContain('age');
    expect(schemaDefinition.required).toContain('email');
    expect(schemaDefinition.required).not.toContain('isActive'); // isActive is optional
  });
});
