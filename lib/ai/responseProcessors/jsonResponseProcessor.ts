// lib/ai/responseProcessors/jsonResponseProcessor.ts
import { AIRequestModel } from '../types';
import { BaseResponseProcessor } from './base';
import Logger from '@/lib/logger';

/**
 * Response processor for JSON responses
 */
export class JsonResponseProcessor extends BaseResponseProcessor<any> {
  /**
   * This processor handles JSON format requests
   */
  canProcess(request: AIRequestModel<any>): boolean {
    return request.responseFormat === 'json';
  }

  /**
   * Process the JSON response by parsing it
   */
  protected async processResponse(response: string, request: AIRequestModel<any>): Promise<any> {
    // Clean up markdown code blocks and whitespace
    const cleanJson = response
      .replace(/```json|```/g, '')
      .replace(/^```(.|\n)*?```$/gm, '')
      .trim();

    try {
      // Attempt to parse as JSON
      return JSON.parse(cleanJson);
    } catch (parseError) {
      Logger.error('JSON parsing error in response processor', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        response: cleanJson.substring(0, 500), // Log a portion of the response
      });

      // If parsing fails, return a structured error
      return {
        error: 'Failed to parse JSON response',
        message: parseError instanceof Error ? parseError.message : String(parseError),
        rawResponse: cleanJson,
      };
    }
  }
}
