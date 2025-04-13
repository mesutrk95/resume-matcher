// lib/ai/promptProcessors/base.ts
import { AIRequestModel } from '../types';
import { PromptProcessingError } from '../errors';

/**
 * Interface for prompt processors
 */
export interface PromptProcessor {
  /**
   * Process a prompt request
   */
  process(request: AIRequestModel<any>): Promise<string>;

  /**
   * Check if this processor can handle the given request
   */
  canProcess(request: AIRequestModel<any>): boolean;
}

/**
 * Abstract base class for prompt processors
 */
export abstract class BasePromptProcessor implements PromptProcessor {
  /**
   * Process a prompt with error handling
   */
  async process(request: AIRequestModel<any>): Promise<string> {
    try {
      return await this.processPrompt(request);
    } catch (error) {
      throw new PromptProcessingError(
        `Error in ${this.constructor.name}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Actual processing logic to be implemented by subclasses
   */
  protected abstract processPrompt(request: AIRequestModel<any>): Promise<string>;

  /**
   * Check if this processor can handle the given request
   */
  abstract canProcess(request: AIRequestModel<any>): boolean;
}
