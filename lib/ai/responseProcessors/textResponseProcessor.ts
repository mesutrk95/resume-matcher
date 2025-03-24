// lib/ai/responseProcessors/textResponseProcessor.ts
import { AIRequestModel } from '../types';
import { BaseResponseProcessor } from './base';

/**
 * Default response processor for text responses
 */
export class TextResponseProcessor extends BaseResponseProcessor<string> {
  /**
   * This processor handles text format requests
   */
  canProcess(request: AIRequestModel<any>): boolean {
    return request.responseFormat === 'text';
  }

  /**
   * Process the text response with basic cleanup
   */
  protected async processResponse(
    response: string,
    request: AIRequestModel<any>,
  ): Promise<string> {
    // Basic cleanup
    return response.trim();
  }
}
