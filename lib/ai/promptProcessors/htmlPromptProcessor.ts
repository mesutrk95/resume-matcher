// lib/ai/promptProcessors/htmlPromptProcessor.ts
import { AIRequestModel } from '../types';
import { BasePromptProcessor } from './base';

/**
 * Prompt processor for HTML responses
 */
export class HtmlPromptProcessor extends BasePromptProcessor {
  /**
   * Optional system context to include with prompts
   */
  private readonly systemContext: string;

  constructor(systemContext: string = '') {
    super();
    this.systemContext = systemContext;
  }

  /**
   * This processor handles HTML format requests
   */
  canProcess(request: AIRequestModel<any>): boolean {
    return request.responseFormat === 'html';
  }

  /**
   * Process the HTML prompt by adding formatting instructions
   */
  protected async processPrompt(request: AIRequestModel<any>): Promise<string> {
    let enhancedPrompt = request.prompt;

    // Add instructions for HTML formatting if not already present
    if (
      !enhancedPrompt.toLowerCase().includes('html format') &&
      !enhancedPrompt.toLowerCase().includes('html tags')
    ) {
      enhancedPrompt +=
        '\n\nEnsure the response is formatted with proper HTML tags. Return clean HTML without markdown code block formatting.';
    }

    // Add system context if available
    if (this.systemContext) {
      enhancedPrompt = `${this.systemContext}\n\n${enhancedPrompt}`;
    }

    return enhancedPrompt;
  }
}
