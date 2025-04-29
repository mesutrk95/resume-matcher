// lib/ai/responseProcessors/jsonResponseProcessor.ts
import { removeNullProperties } from '@/lib/utils';
import { ResponseProcessingError } from '../errors';
import { AIRequestModel } from '../types';
import { BaseResponseProcessor } from './base';

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
  protected async processResponse(response: string, _request: AIRequestModel<any>): Promise<any> {
    // Clean up markdown code blocks and whitespace
    const cleanJson = response
      .replace(/```json|```/g, '')
      .replace(/^```(.|\n)*?```$/gm, '')
      .trim();

    try {
      // Attempt to parse as JSON
      return removeNullProperties(JSON.parse(cleanJson));
    } catch (parseError) {
      throw new ResponseProcessingError('Failed to parse JSON response');
    }
  }
}
