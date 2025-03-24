// lib/ai/responseProcessors/htmlResponseProcessor.ts
import { AIRequestModel } from '../types';
import { BaseResponseProcessor } from './base';

/**
 * Response processor for HTML responses
 */
export class HtmlResponseProcessor extends BaseResponseProcessor<string> {
  /**
   * This processor handles HTML format requests
   */
  canProcess(request: AIRequestModel<any>): boolean {
    return request.responseFormat === 'html';
  }

  /**
   * Process the HTML response with cleanup
   */
  protected async processResponse(
    response: string,
    request: AIRequestModel<any>,
  ): Promise<string> {
    // Clean up markdown code blocks
    let cleanHtml = response
      .replace(/```html|```/g, '')
      .replace(/^```(.|\n)*?```$/gm, '')
      .trim();

    // Ensure HTML document has basic structure if missing
    if (
      !cleanHtml.includes('<html') &&
      !request.prompt.toLowerCase().includes('fragment')
    ) {
      // Check if it's just a fragment or a full document is expected
      if (cleanHtml.startsWith('<body') || cleanHtml.startsWith('<!DOCTYPE')) {
        // It already has some structure, leave it alone
        return cleanHtml;
      }

      // If it's primarily tags and not just text, wrap it in a body tag
      if ((cleanHtml.match(/<[^>]+>/g) || []).length > 2) {
        if (!cleanHtml.includes('<body')) {
          cleanHtml = `<body>\n${cleanHtml}\n</body>`;
        }

        if (!cleanHtml.includes('<html')) {
          cleanHtml = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n</head>\n${cleanHtml}\n</html>`;
        }
      }
    }

    return cleanHtml;
  }
}
