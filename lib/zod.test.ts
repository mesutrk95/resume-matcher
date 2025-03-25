import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { zodSchemaToString } from './zod';

describe('zodSchemaToString', () => {
  it('handles string schema', () => {
    const schema = z.string();
    expect(zodSchemaToString(schema)).toBe('string');
  });

  it('handles string schema with constraints', () => {
    const schema = z.string().min(5).max(10).email();
    const result = zodSchemaToString(schema);
    expect(result).toContain('string');
    expect(result).toContain('min length: 5');
    expect(result).toContain('max length: 10');
    expect(result).toContain('valid email format');
  });

  it('handles number schema with constraints', () => {
    const schema = z.number().int().min(0).max(100);
    const result = zodSchemaToString(schema);
    expect(result).toContain('number');
    expect(result).toContain('integer');
    expect(result).toContain('min: 0');
    expect(result).toContain('max: 100');
  });

  it('handles boolean schema', () => {
    const schema = z.boolean();
    expect(zodSchemaToString(schema)).toBe('boolean');
  });

  it('handles enum schema', () => {
    const schema = z.enum(['apple', 'banana', 'cherry']);
    expect(zodSchemaToString(schema)).toBe(
      'enum: one of ["apple", "banana", "cherry"]',
    );
  });

  it('handles literal schema', () => {
    const schema = z.literal('success');
    expect(zodSchemaToString(schema)).toBe('literal: "success"');
  });

  it('handles union schema', () => {
    const schema = z.union([z.string(), z.number()]);
    expect(zodSchemaToString(schema)).toBe('one of: [string | number]');
  });

  it('handles array schema', () => {
    const schema = z.array(z.string());
    expect(zodSchemaToString(schema)).toBe('Array of string');
  });

  it('handles array of objects schema', () => {
    const schema = z.array(z.object({ name: z.string() }));
    expect(zodSchemaToString(schema)).toBe('Array of object');
  });

  it('handles nested object schema', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });

    const result = zodSchemaToString(schema);
    expect(result).toContain('"user" (required): object');
  });

  it('handles object schema with optional fields', () => {
    const schema = z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    });

    const result = zodSchemaToString(schema);
    expect(result).toContain('"id" (required): string');
    expect(result).toContain('"name" (optional): string');
    expect(result).toContain('"email" (optional): string (valid email format)');
  });

  it('handles complex object schema', () => {
    const userSchema = z.object({
      id: z.string().uuid(),
      name: z.string().min(2),
      email: z.string().email(),
      age: z.number().int().positive().optional(),
      roles: z.array(z.enum(['admin', 'user', 'guest'])),
      settings: z
        .object({
          theme: z.enum(['light', 'dark']).optional(),
          notifications: z.boolean().default(true),
        })
        .optional(),
      lastLogin: z.date().nullable(),
    });

    const result = zodSchemaToString(userSchema);

    // Should be an object representation
    expect(result.startsWith('{')).toBe(true);
    expect(result.endsWith('}')).toBe(true);

    // Should contain all the fields
    expect(result).toContain('"id"');
    expect(result).toContain('"name"');
    expect(result).toContain('"email"');
    expect(result).toContain('"age"');
    expect(result).toContain('"roles"');
    expect(result).toContain('"settings"');
    expect(result).toContain('"lastLogin"');

    // Check for some specific type descriptions
    expect(result).toContain(
      'array of enum: one of ["admin", "user", "guest"]',
    );
    expect(result).toContain('(optional): object');
  });

  it('handles nullable schema', () => {
    const schema = z.string().nullable();
    expect(zodSchemaToString(schema)).toBe('string or null');
  });

  it('handles record schema', () => {
    const schema = z.record(z.string());
    expect(zodSchemaToString(schema)).toBe('record with values of type string');
  });

  it('handles tuple schema', () => {
    const schema = z.tuple([z.string(), z.number(), z.boolean()]);
    expect(zodSchemaToString(schema)).toBe('tuple [string, number, boolean]');
  });
});
