// lib/ai/responseProcessors/base.ts
import { AIRequestModel } from '../types';
import { ResponseProcessingError } from '../errors';

/**
 * Interface for response processors
 */
export interface ResponseProcessor<T = any> {
  /**
   * Process a response
   */
  process(response: string, request: AIRequestModel<T>): Promise<T>;

  /**
   * Check if this processor can handle the given request
   */
  canProcess(request: AIRequestModel<T>): boolean;
}

/**
 * Abstract base class for response processors
 */
export abstract class BaseResponseProcessor<T = any> implements ResponseProcessor<T> {
  /**
   * Process a response with error handling
   */
  async process(response: string, request: AIRequestModel<T>): Promise<T> {
    try {
      return await this.processResponse(response, request);
    } catch (error) {
      throw new ResponseProcessingError(
        `Error in ${this.constructor.name}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Actual processing logic to be implemented by subclasses
   */
  protected abstract processResponse(response: string, request: AIRequestModel<T>): Promise<T>;

  /**
   * Check if this processor can handle the given request
   */
  abstract canProcess(request: AIRequestModel<T>): boolean;
}
