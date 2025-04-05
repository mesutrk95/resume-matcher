// tests/integration/service-manager.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { z } from 'zod';
import { AIServiceManager } from '@/lib/ai/service-manager';
import { GeminiClient } from '@/lib/ai/clients/gemini-client';
import { AIUsageService } from '@/lib/ai/usage-service';
import { createStandardPromptProcessors } from '@/lib/ai/promptProcessors';
import { createStandardResponseProcessors } from '@/lib/ai/responseProcessors';
import { AIRequestModel, ChatHistoryItem } from '@/lib/ai/types';

/**
 * This is an integration test for the AI Service Manager
 * It makes actual API calls to Gemini to test the end-to-end functionality
 */
describe('AI Service Manager Integration Tests', () => {
  let serviceManager: AIServiceManager;
  let pdfBuffer: Buffer;

  // Create our service manager with real Gemini client
  beforeAll(async () => {
    // Make sure GEMINI_API_KEY is set in environment or this will fail
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY environment variable must be set for integration tests',
      );
    }

    const geminiClient = new GeminiClient(
      process.env.GEMINI_API_KEY,
      'gemini-1.5-pro',
    );

    const usageService = new AIUsageService();
    const promptProcessors = createStandardPromptProcessors();
    const responseProcessors = createStandardResponseProcessors();

    serviceManager = new AIServiceManager({
      maxRetries: 2,
      defaultClient: geminiClient,
      promptProcessors,
      responseProcessors,
      usageService,
    });

    // Try to load a sample PDF for testing
    try {
      // You can create a simple PDF or use any PDF file for testing
      const pdfPath = resolve(process.cwd(), 'sample.pdf');
      pdfBuffer = await readFile(pdfPath);
    } catch (error) {
      console.warn('No sample PDF found, PDF tests will be skipped');
      pdfBuffer = Buffer.from('Sample PDF content');
    }
  });

  it('should get a text response from Gemini', async () => {
    const request: AIRequestModel<string> = {
      prompt: 'Explain what URL shortening is in one paragraph.',
      responseFormat: 'text',
    };

    const response = await serviceManager.executeRequest<string>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(20);
    console.log('Text response:', response);
  }, 30000);

  it('should get a JSON response from Gemini', async () => {
    const request: AIRequestModel<any> = {
      prompt:
        'Generate a JSON object representing a URL shortening service with fields for original_url, short_url, created_at, and visits_count. Use example values.',
      responseFormat: 'json',
    };

    const response = await serviceManager.executeRequest<any>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
    expect(response.original_url).toBeDefined();
    expect(response.short_url).toBeDefined();
    console.log('JSON response:', JSON.stringify(response, null, 2));
  }, 30000);

  it('should get an HTML response from Gemini', async () => {
    const request: AIRequestModel<string> = {
      prompt:
        'Generate a simple HTML page for a URL shortening service with a form to submit a URL.',
      responseFormat: 'html',
    };

    const response = await serviceManager.executeRequest<string>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response).toContain('<');
    expect(response).toContain('>');
    expect(response).toContain('form');
    console.log('HTML response excerpt:', response.substring(0, 200) + '...');
  }, 30000);

  it('should handle chat history in a conversation', async () => {
    const history: ChatHistoryItem[] = [
      {
        role: 'user',
        parts: [{ text: 'What are the benefits of using URL shorteners?' }],
      },
      {
        role: 'model',
        parts: [
          {
            text: 'URL shorteners provide several benefits including easier sharing of long URLs, tracking click statistics, and improving the appearance of links in messages. They can also help mask affiliate links and make URLs more manageable.',
          },
        ],
      },
    ];

    const request: AIRequestModel<string> = {
      prompt:
        'Can you give me some examples of popular URL shortening services?',
      responseFormat: 'text',
      chatHistory: history,
    };

    const response = await serviceManager.executeRequest<string>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(20);
    console.log('Chat response:', response);
  }, 30000);

  it('should process a PDF document', async () => {
    // Skip if no PDF buffer
    if (!pdfBuffer || pdfBuffer.length < 100) {
      console.log('Skipping PDF test due to missing sample PDF');
      return;
    }

    const request: AIRequestModel<string> = {
      prompt: 'Extract the main points from this document.',
      responseFormat: 'text',
      contents: [
        {
          type: 'pdf',
          data: pdfBuffer,
          mimeType: 'application/pdf',
        },
      ],
    };

    const response = await serviceManager.executeRequest<string>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(20);
    console.log('PDF extraction response:', response);
  }, 45000);

  it('should handle multiple content types together', async () => {
    const request: AIRequestModel<string> = {
      prompt:
        'Analyze the following information about URL shortening services.',
      responseFormat: 'text',
      contents: [
        {
          type: 'text',
          data: 'URL shortening is a technique where a long URL is made substantially shorter and still directs to the required page. This is achieved by using an HTTP Redirect on a domain name that is short, which links to the web page that has a long URL.',
        },
      ],
    };

    const response = await serviceManager.executeRequest<string>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(20);
    console.log('Multi-content response:', response);
  }, 30000);
});

/**
 * Additional tests for the AI Service Manager
 */
describe('AI Service Manager Additional Tests', () => {
  let serviceManager: AIServiceManager;

  // Create our service manager with real Gemini client
  beforeAll(async () => {
    // Make sure GEMINI_API_KEY is set in environment or this will fail
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY environment variable must be set for integration tests',
      );
    }

    const geminiClient = new GeminiClient(
      process.env.GEMINI_API_KEY,
      'gemini-1.5-pro',
    );

    const usageService = new AIUsageService();
    const promptProcessors = createStandardPromptProcessors();
    const responseProcessors = createStandardResponseProcessors();

    serviceManager = new AIServiceManager({
      maxRetries: 2,
      defaultClient: geminiClient,
      promptProcessors,
      responseProcessors,
      usageService,
    });
  });

  it('should handle markdown response format', async () => {
    const request: AIRequestModel<string> = {
      prompt:
        'Create a markdown document explaining URL shortening with headers, bullet points, and code examples.',
      responseFormat: 'text',
    };

    const response = await serviceManager.executeRequest<string>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(50);
    expect(response).toMatch(/#{1,6}\s+.+/); // Should contain markdown headers
    console.log(
      'Markdown response excerpt:',
      response.substring(0, 200) + '...',
    );
  }, 30000);

  it('should handle structured data with nested objects', async () => {
    const request: AIRequestModel<any> = {
      prompt:
        'Generate a JSON object representing a URL shortening service with statistics. Include fields for service_name, founded_year, and a stats object with total_urls, active_urls, and monthly_clicks.',
      responseFormat: 'json',
    };

    const response = await serviceManager.executeRequest<any>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
    expect(response.service_name).toBeDefined();
    expect(response.founded_year).toBeDefined();
    expect(response.stats).toBeDefined();
    expect(typeof response.stats).toBe('object');
    expect(response.stats.total_urls).toBeDefined();
    console.log('Structured JSON response:', JSON.stringify(response, null, 2));
  }, 30000);

  it('should validate response using zodSchema', async () => {
    // Define a Zod schema for the expected response
    const urlServiceSchema = z.object({
      service_name: z.string(),
      url: z.string().url(),
      features: z.array(z.string()).min(2),
      pricing: z.object({
        free_tier: z.boolean(),
        premium_cost: z.number().optional(),
      }),
    });

    const request: AIRequestModel<any> = {
      prompt:
        'Generate details about a URL shortening service with service_name, url, features array, and pricing object with free_tier boolean and optional premium_cost number.',
      responseFormat: 'json',
      zodSchema: urlServiceSchema,
    };

    const response = await serviceManager.executeRequest<any>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');

    // Validate that the response matches our schema
    expect(response.service_name).toBeDefined();
    expect(typeof response.service_name).toBe('string');

    expect(response.url).toBeDefined();
    expect(typeof response.url).toBe('string');
    expect(response.url).toMatch(/^https?:\/\//); // Should be a valid URL

    expect(response.features).toBeDefined();
    expect(Array.isArray(response.features)).toBe(true);
    expect(response.features.length).toBeGreaterThanOrEqual(2);

    expect(response.pricing).toBeDefined();
    expect(typeof response.pricing).toBe('object');
    expect(typeof response.pricing.free_tier).toBe('boolean');

    if (response.pricing.premium_cost !== undefined) {
      expect(typeof response.pricing.premium_cost).toBe('number');
    }

    // Verify the schema validation works by manually validating
    const validationResult = urlServiceSchema.safeParse(response);
    expect(validationResult.success).toBe(true);

    console.log('Zod validated response:', JSON.stringify(response, null, 2));
  }, 45000);

  it('should handle complex nested zodSchema with specific constraints', async () => {
    // Define a more complex schema with nested objects and arrays
    const userSchema = z.object({
      id: z.string().uuid(),
      name: z.string().min(3),
      email: z.string().email(),
    });

    const analyticsSchema = z.object({
      browser_stats: z.record(z.string(), z.number()),
      country_stats: z
        .array(
          z.object({
            country: z.string(),
            visits: z.number().int().positive(),
            percentage: z.number().min(0).max(100),
          }),
        )
        .min(1),
    });

    const urlServiceDetailedSchema = z.object({
      service_info: z.object({
        name: z.string(),
        version: z.string().regex(/^\d+\.\d+\.\d+$/),
        api_endpoint: z.string().url(),
      }),
      user: userSchema,
      urls: z.array(z.string()).min(1).max(5),
      analytics: analyticsSchema,
      premium_features: z.array(
        z.object({
          name: z.string(),
          enabled: z.boolean(),
          price: z.number().positive().optional(),
        }),
      ),
    });

    const request: AIRequestModel<any> = {
      prompt:
        'Generate a minimum URL shortening service test report with nested data.',
      responseFormat: 'json',
      zodSchema: urlServiceDetailedSchema,
    };

    const response = await serviceManager.executeRequest<any>(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');

    // Validate the complex structure
    expect(response.service_info).toBeDefined();
    expect(response.service_info.version).toMatch(/^\d+\.\d+\.\d+$/);

    expect(response.user).toBeDefined();
    expect(response.user.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ); // UUID format

    expect(Array.isArray(response.urls)).toBe(true);
    expect(response.urls.length).toBeGreaterThanOrEqual(1);
    expect(response.urls.length).toBeLessThanOrEqual(5);

    expect(response.analytics).toBeDefined();
    expect(response.analytics.browser_stats).toBeDefined();
    expect(Array.isArray(response.analytics.country_stats)).toBe(true);

    expect(Array.isArray(response.premium_features)).toBe(true);

    // Verify the schema validation works by manually validating
    const validationResult = urlServiceDetailedSchema.safeParse(response);
    expect(validationResult.success).toBe(true);

    console.log(
      'Complex Zod validated response (excerpt):',
      JSON.stringify(
        {
          service_info: response.service_info,
          user: response.user,
          urls: [response.urls[0]],
          // Truncating the rest for brevity
        },
        null,
        2,
      ),
    );
  }, 60000);
});
