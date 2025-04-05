// tests/integration/service-manager.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
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
