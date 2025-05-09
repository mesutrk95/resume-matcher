import Ajv from 'ajv';

export const validateJsonSchema = (
  schema: string,
): {
  valid: boolean;
  errors?: string[];
} => {
  try {
    const parsedSchema = JSON.parse(schema);

    const ajv = new Ajv();
    ajv.compile(parsedSchema);

    return {
      valid: true,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        'Invalid JSON schema provided. Please ensure the schema is a valid JSON object.',
        error instanceof Error ? error.message : String(error),
      ],
    };
  }
};
