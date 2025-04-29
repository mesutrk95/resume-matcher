// lib/ai/promptProcessors/jsonPromptProcessor.ts
import { AIRequestModel } from '../types';
import { BasePromptProcessor } from './base';

/**
 * Prompt processor for JSON responses
 */
export class JsonPromptProcessor extends BasePromptProcessor {
  /**
   * Optional system context to include with prompts
   */
  private readonly systemContext: string;

  constructor(systemContext: string = '') {
    super();
    this.systemContext = systemContext;
  }

  /**
   * This processor handles JSON format requests
   */
  canProcess(request: AIRequestModel<any>): boolean {
    return request.responseFormat === 'json';
  }

  /**
   * Process the JSON prompt by adding formatting instructions
   */
  protected async processPrompt(request: AIRequestModel<any>): Promise<string> {
    let enhancedPrompt = request.prompt;

    // Add instructions for JSON formatting if not already present
    if (
      !enhancedPrompt.toLowerCase().includes('json format') &&
      !enhancedPrompt.toLowerCase().includes('valid json')
    ) {
      enhancedPrompt +=
        '\nOmit any properties with null values from the response. Fill all required fields anyway. Ensure the response is in a valid JSON format with no extra text or markdown formatting.';
    }

    // Add system context if available
    if (this.systemContext) {
      enhancedPrompt = `${this.systemContext}\n${enhancedPrompt}`;
    }

    return enhancedPrompt;
  }
}
