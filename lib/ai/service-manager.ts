// lib/ai/service-manager.ts
import { GeminiClient } from './clients/gemini-client';
import {
  AIModelClient,
  AIRequestModel,
  ContentItem,
  ResponseFormat,
} from './types';
import Logger from '@/lib/logger';
import { getCurrentRequestId } from '@/lib/request-context';
import { AIUsageService } from './usage-service';
import { TokenLimitExceededError, AIServiceError } from './errors';
import { PromptProcessor } from './promptProcessors/base';
import { ResponseProcessor } from './responseProcessors/base';

// Configuration for the AI Service Manager
export interface AIServiceManagerConfig {
  maxRetries: number;
  defaultClient?: AIModelClient;
  promptProcessors: PromptProcessor[];
  responseProcessors: ResponseProcessor[];
  usageService: AIUsageService;
}

export class AIServiceManager {
  private readonly maxRetries: number;
  private readonly defaultClient: AIModelClient;
  private readonly promptProcessors: PromptProcessor[];
  private readonly responseProcessors: ResponseProcessor[];
  private readonly usageService: AIUsageService;

  constructor(config: AIServiceManagerConfig) {
    this.maxRetries = config.maxRetries || 2;
    this.promptProcessors = config.promptProcessors || [];
    this.responseProcessors = config.responseProcessors || [];
    this.usageService = config.usageService;

    this.defaultClient =
      config.defaultClient ||
      new GeminiClient(process.env.GEMINI_API_KEY || '', 'gemini-1.5-pro');
  }

  /**
   * Execute an AI request with retry capabilities and response validation
   */
  async executeRequest<T>(request: AIRequestModel<T>): Promise<T> {
    const requestId = request.context?.requestId || getCurrentRequestId();
    const userId = request.context?.userId;
    let retryCount = 0;
    let lastError: Error | null = null;

    // Check usage limits if user ID is provided
    if (userId) {
      const canProceed = await this.usageService.checkAndRecordIntent(
        userId,
        this.estimateTokenUsage(request),
      );

      if (!canProceed) {
        throw new TokenLimitExceededError('Token usage limit exceeded');
      }
    }

    // Process the prompt
    const processedPrompt = await this.processPrompt(request);

    // Select the client (currently just using default)
    const client = this.getClientForRequest(request);

    // Retry loop
    while (retryCount <= this.maxRetries) {
      try {
        // Call the AI service
        const response = await client.generateContent(
          processedPrompt,
          request.contents,
          request.options,
        );

        // Record actual token usage
        if (userId) {
          await this.usageService.recordUsage(
            userId,
            response.tokenUsage.promptTokens,
            response.tokenUsage.completionTokens,
          );
        }

        // Process the response
        const processedResponse = await this.processResponse(
          response.content,
          request,
        );

        // Validate the response if a validator is provided
        if (request.responseValidator) {
          const validationResult = request.responseValidator(processedResponse);
          if (!validationResult.valid) {
            if (retryCount < this.maxRetries) {
              Logger.warn(
                `Response validation failed on attempt ${retryCount + 1}`,
                {
                  requestId,
                  errors: validationResult.errors,
                  responseExcerpt: response.content.substring(0, 100),
                },
              );
              retryCount++;
              continue;
            } else {
              // On last retry, still return the response but log the validation failure
              Logger.error(
                `Response validation failed after ${retryCount + 1} attempts`,
                {
                  requestId,
                  errors: validationResult.errors,
                  responseExcerpt: response.content.substring(0, 100),
                },
              );
              return processedResponse;
            }
          }
        }

        // Success - return the processed response
        return processedResponse;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        Logger.error(`AI request failed on attempt ${retryCount + 1}`, {
          requestId,
          error: lastError.message,
          retryCount,
        });

        if (retryCount < this.maxRetries) {
          retryCount++;
          // Could add exponential backoff here if needed
          continue;
        } else {
          // Record failed attempt in usage service
          if (userId) {
            await this.usageService.recordFailedAttempt(userId);
          }
          throw new AIServiceError(
            `AI request failed after ${retryCount + 1} attempts: ${
              lastError.message
            }`,
            { cause: lastError },
          );
        }
      }
    }

    // This should never be reached due to the throw in the catch block
    throw new AIServiceError('Unexpected execution path in AI service', {
      cause: lastError,
    });
  }

  /**
   * Estimate token usage for a request
   */
  private estimateTokenUsage(request: AIRequestModel<any>): number {
    // Calculate prompt tokens (simple estimation)
    let estimatedTokens = this.defaultClient.calculateTokens(request.prompt);

    // Add tokens for each content item that's text
    if (request.contents) {
      for (const content of request.contents) {
        if (content.type === 'text' && typeof content.data === 'string') {
          estimatedTokens += this.defaultClient.calculateTokens(content.data);
        } else {
          // For non-text content, add a fixed estimate
          // This is very rough and should be refined based on actual usage
          estimatedTokens += 500;
        }
      }
    }

    // Add estimated completion tokens based on model/use case
    // This is just a rough estimate and should be tuned based on actual usage patterns
    const estimatedResponseTokens = Math.ceil(estimatedTokens * 0.5); // Assume response is ~50% the size of prompt

    return estimatedTokens + estimatedResponseTokens;
  }

  /**
   * Get the appropriate AI client for this request
   */
  private getClientForRequest(request: AIRequestModel<any>): AIModelClient {
    // Future enhancement: select different clients based on request properties
    // For now, just return the default client
    return this.defaultClient;
  }

  /**
   * Process the prompt using available prompt processors
   */
  private async processPrompt(request: AIRequestModel<any>): Promise<string> {
    // Find the first matching processor
    for (const processor of this.promptProcessors) {
      if (processor.canProcess(request)) {
        return await processor.process(request);
      }
    }

    // No processor found, return the original prompt
    return request.prompt;
  }

  /**
   * Process the response using available response processors
   */
  private async processResponse<T>(
    response: string,
    request: AIRequestModel<T>,
  ): Promise<T> {
    // Find the first matching processor
    for (const processor of this.responseProcessors) {
      if (processor.canProcess(request)) {
        return await processor.process(response, request);
      }
    }

    // No processor found, apply basic formatting based on responseFormat
    return this.formatResponse(response, request.responseFormat) as T;
  }

  /**
   * Format the response based on the requested format
   */
  private formatResponse(response: string, format: ResponseFormat): any {
    switch (format) {
      case 'json':
        try {
          return JSON.parse(response.replace(/```json|```/g, '').trim());
        } catch (error) {
          Logger.error('Failed to parse JSON response', { error });
          return {
            error: 'Failed to parse JSON response',
            rawResponse: response,
          };
        }

      case 'html':
        return response.replace(/```html|```/g, '').trim();

      case 'text':
      default:
        return response;
    }
  }
}
