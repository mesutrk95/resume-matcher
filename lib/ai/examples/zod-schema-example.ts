import * as z from 'zod';
import { AIServiceManager } from '../service-manager';
import { AIRequestModel } from '../types';
import { AIUsageService } from '../usage-service';

// Example usage of the zodSchema property

// Define a Zod schema for the expected response
const userProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  interests: z.array(z.string()).min(1),
  isActive: z.boolean(),
});

// Type inference from the Zod schema
type UserProfile = z.infer<typeof userProfileSchema>;

async function exampleWithZodSchema() {
  // Initialize the AI service manager
  const usageService = new AIUsageService();
  const serviceManager = new AIServiceManager({
    maxRetries: 2,
    promptProcessors: [],
    responseProcessors: [],
    usageService,
  });

  // Create a request with zodSchema
  const request: AIRequestModel<UserProfile> = {
    prompt: 'Generate a user profile for a tech enthusiast in their 30s',
    responseFormat: 'json',
    zodSchema: userProfileSchema, // Using the zodSchema property
    options: {
      temperature: 0.7,
    },
  };

  try {
    // Execute the request
    const result = await serviceManager.executeRequest(request);

    // The result is already validated against the schema
    console.log('Valid user profile:', result);

    // TypeScript knows the shape of the result
    console.log(`Name: ${result.name}`);
    console.log(`Email: ${result.email}`);
    console.log(`Age: ${result.age || 'Not specified'}`);
    console.log(`Interests: ${result.interests.join(', ')}`);
    console.log(`Active: ${result.isActive ? 'Yes' : 'No'}`);

    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Alternative approach: without zodSchema, using responseValidator
async function exampleWithResponseValidator() {
  // Initialize the AI service manager
  const usageService = new AIUsageService();
  const serviceManager = new AIServiceManager({
    maxRetries: 2,
    promptProcessors: [],
    responseProcessors: [],
    usageService,
  });

  // Create a request with responseValidator
  const request: AIRequestModel<UserProfile> = {
    prompt: 'Generate a user profile for a tech enthusiast in their 30s',
    responseFormat: 'json',
    responseValidator: data => {
      const result = userProfileSchema.safeParse(data);
      if (!result.success) {
        return {
          valid: false,
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        };
      }
      return { valid: true };
    },
    options: {
      temperature: 0.7,
    },
  };

  try {
    const result = await serviceManager.executeRequest(request);
    console.log('Valid user profile:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Export both examples
export { exampleWithZodSchema, exampleWithResponseValidator };
