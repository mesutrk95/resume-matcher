// lib/ai/promptProcessors/textPromptProcessor.ts
import { AIRequestModel } from '../types';
import { BasePromptProcessor } from './base';

/**
 * Prompt processor for text responses
 */
export class TextPromptProcessor extends BasePromptProcessor {
  /**
   * Optional system context to include with prompts
   */
  private readonly systemContext: string;

  constructor(systemContext: string = '') {
    super();
    this.systemContext = systemContext;
  }

  /**
   * This processor handles text format requests
   */
  canProcess(request: AIRequestModel<any>): boolean {
    return request.responseFormat === 'text';
  }

  /**
   * Process the text prompt
   */
  protected async processPrompt(request: AIRequestModel<any>): Promise<string> {
    // If there's system context, prepend it to the prompt
    if (this.systemContext) {
      return `${this.systemContext}\n\n${request.prompt}`;
    }

    return request.prompt;
  }
}
