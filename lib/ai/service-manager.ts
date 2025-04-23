import { GeminiClient } from './clients/gemini-client';
import { AIModelClient, AIRequestModel, ResponseFormat } from './types';
import Logger from '@/lib/logger';
import { getCurrentRequestId } from '@/lib/request-context';
import { AIUsageService } from './usage-service';
import { TokenLimitExceededError, AIServiceError, RateLimitExceededError } from './errors';
import { AIRateLimitService } from './rate-limit-service';
import { PromptProcessor } from './promptProcessors/base';
import { ResponseProcessor } from './responseProcessors/base';
import { createJsonSchemaValidator } from './validators';
import { zodSchemaToString } from '@/lib/zod';

export interface AIServiceManagerConfig {
  maxRetries: number;
  defaultClient?: AIModelClient;
  promptProcessors: PromptProcessor[];
  responseProcessors: ResponseProcessor[];
  usageService: AIUsageService;
  rateLimitService?: AIRateLimitService;
}

export class AIServiceManager {
  private readonly maxRetries: number;
  private readonly defaultClient: AIModelClient;
  private readonly promptProcessors: PromptProcessor[];
  private readonly responseProcessors: ResponseProcessor[];
  private readonly usageService: AIUsageService;
  private readonly rateLimitService?: AIRateLimitService;

  constructor(config: AIServiceManagerConfig) {
    this.maxRetries = config.maxRetries || 2;
    this.promptProcessors = config.promptProcessors || [];
    this.responseProcessors = config.responseProcessors || [];
    this.usageService = config.usageService;
    this.rateLimitService = config.rateLimitService;

    // Initialize default client but allow it to be overridden for testing
    this.defaultClient =
      config.defaultClient || new GeminiClient(process.env.GEMINI_API_KEY || '', 'gemini-1.5-pro');
  }

  /**
   * Execute an AI request with retry capabilities and response validation
   */
  async executeRequest<T>(request: AIRequestModel<T>): Promise<T> {
    // If zodSchema is provided, create a validator from it
    if (request.zodSchema && !request.responseValidator) {
      request.responseValidator = createJsonSchemaValidator(request.zodSchema);

      // Add schema information to the prompt if it's not a chat request
      if (!request.chatHistory || request.chatHistory.length === 0) {
        const schemaInfo = zodSchemaToString(request.zodSchema);
        request.prompt = `${request.prompt}\n\nJson Response should match this Json schema: ${schemaInfo}`;
      }
    }
    const requestId = request.context?.requestId || getCurrentRequestId();
    const userId = request.context?.userId;
    let retryCount = 0;
    let lastError: Error | null = null;

    // Check if this is a chat request
    const isChatRequest = request.chatHistory && request.chatHistory.length > 0;

    // Check usage limits if user ID is provided
    if (userId) {
      // Check token usage limits
      const canProceed = await this.usageService.checkAndRecordIntent(
        userId,
        this.estimateTokenUsage(request),
      );

      if (!canProceed) {
        throw new TokenLimitExceededError('Token usage limit exceeded');
      }

      // Check rate limits if rate limit service is provided
      if (this.rateLimitService) {
        // Select the client to get its ID
        const client = this.getClientForRequest(request);
        const clientId = client.getClientId();

        const rateLimitCheck = await this.rateLimitService.checkRateLimit(userId, clientId);

        if (!rateLimitCheck.allowed) {
          throw new RateLimitExceededError(rateLimitCheck.reason || 'Rate limit exceeded');
        }
      }
    }

    // Select the client (currently just using default)
    const client = this.getClientForRequest(request);

    // Retry loop
    while (retryCount <= this.maxRetries) {
      try {
        let response;

        if (isChatRequest) {
          // Handle chat request
          response = await client.generateChatContent(
            request.chatHistory!,
            request.systemInstruction,
            request.options,
          );
        } else {
          // Process the prompt for non-chat requests
          const processedPrompt = await this.processPrompt(request);

          // Call the AI service with the processed prompt
          response = await client.generateContent(
            processedPrompt,
            request.contents,
            request.options,
          );
        }

        // Record actual token usage
        if (userId) {
          await this.usageService.recordUsage(
            userId,
            response.tokenUsage.promptTokens,
            response.tokenUsage.completionTokens,
          );

          // Record request for rate limiting if rate limit service is provided
          if (this.rateLimitService) {
            const client = this.getClientForRequest(request);
            await this.rateLimitService.recordRequest(userId, client.getClientId());
          }
        }

        // Process the response
        const processedResponse = await this.processResponse(response.content, request);

        // Validate the response if a validator is provided
        if (request.responseValidator) {
          const validationResult = request.responseValidator(processedResponse);
          if (!validationResult.valid) {
            if (retryCount < this.maxRetries) {
              Logger.warn(`Response validation failed on attempt ${retryCount + 1}`, {
                requestId,
                errors: validationResult.errors,
                responseExcerpt: response.content.substring(0, 100),
              });
              retryCount++;
              continue;
            } else {
              // On last retry, still return the response but log the validation failure
              Logger.error(`Response validation failed after ${retryCount + 1} attempts`, {
                requestId,
                errors: validationResult.errors,
                responseExcerpt: response.content.substring(0, 100),
              });
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
            `AI request failed after ${retryCount + 1} attempts: ${lastError.message}`,
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
    let estimatedTokens = 0;

    // For chat requests, estimate based on chat history
    if (request.chatHistory && request.chatHistory.length > 0) {
      // Add tokens for system instruction if present
      if (request.systemInstruction) {
        estimatedTokens += this.defaultClient.calculateTokens(request.systemInstruction);
      }

      // Add tokens for each message in the history
      for (const message of request.chatHistory) {
        for (const part of message.parts) {
          if ('text' in part && part.text) {
            estimatedTokens += this.defaultClient.calculateTokens(part.text);
          } else if ('inlineData' in part && part.inlineData) {
            // For non-text parts (like images), add a fixed estimate
            estimatedTokens += 500;
          }
        }
      }
    } else {
      // For regular requests, calculate based on prompt
      estimatedTokens = this.defaultClient.calculateTokens(request.prompt);

      // Add tokens for each content item
      if (request.contents) {
        for (const content of request.contents) {
          if (content.type === 'text' && typeof content.data === 'string') {
            estimatedTokens += this.defaultClient.calculateTokens(content.data);
          } else {
            // For non-text content, add a fixed estimate
            estimatedTokens += 500;
          }
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
  private getClientForRequest(_request: AIRequestModel<any>): AIModelClient {
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
  private async processResponse<T>(response: string, request: AIRequestModel<T>): Promise<T> {
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
