import { GeminiClient } from './clients/gemini-client';
import { AIModelClient, AIRequestModel, ResponseFormat } from './types';
import Logger from '@/lib/logger';
import { getCurrentRequestId } from '@/lib/request-context';
import { AIUsageService } from './usage-service';
import {
  TokenLimitExceededError,
  AIServiceError,
  RateLimitExceededError,
  ValidationError,
} from './errors';
import { AIRateLimitService } from './rate-limit-service';
import { PromptProcessor } from './promptProcessors/base';
import { ResponseProcessor } from './responseProcessors/base';
import { createJsonSchemaValidator } from './validators';
import { currentUser } from '@/lib/auth';
import { Reasons } from '@/domains/reasons';
import { saveStuff } from '../prompt-log-service';

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
      config.defaultClient ||
      new GeminiClient(process.env.GEMINI_API_KEY || '', 'gemini-1.5-flash');
  }

  /**
   * Execute an AI request with retry capabilities and response validation
   */
  async executeRequest<T>(request: AIRequestModel<T>): Promise<T> {
    // If zodSchema is provided, create a validator from it
    if (request.zodSchema && !request.responseValidator) {
      request.responseValidator = createJsonSchemaValidator(request.zodSchema);
    }
    const requestId = request.context?.requestId || (await getCurrentRequestId());
    const userId = request.context?.userId || (await currentUser())?.id;
    const reason = request.context?.reason || Reasons.GENERAL;
    let retryCount = 0;
    let lastError: Error | null = null;

    // Check if this is a chat request
    const isChatRequest = request.chatHistory && request.chatHistory.length > 0;

    // Check usage limits if user ID is provided
    if (userId) {
      // Check token usage limits
      const canProceed = await this.usageService.checkIntent(userId);

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
        let validationErrors: string[] | undefined;
        const startTime = performance.now();

        if (isChatRequest) {
          // Handle chat request
          response = await client.generateChatContent(
            request.chatHistory!,
            request.systemInstruction,
            request.options,
          );
        } else {
          // Process the prompt for non-chat requests
          const processedPrompt = await this.processPrompt(request, validationErrors);

          // Call the AI service with the processed prompt
          response = await client.generateContent(
            processedPrompt,
            request.contents,
            request.options,
          );
        }

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        if (userId) {
          this.recordUsage(
            userId,
            reason,
            client.getClientId(),
            response.tokenUsage.promptTokens,
            response.tokenUsage.completionTokens,
            responseTime,
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
              });
              // Append validation errors to the prompt for the next attempt
              validationErrors = validationResult.errors;
              saveStuff('FailedValidationPrompts', {
                prompt: request.prompt,
                processedResponse,
                response: response,
                validationResult,
                reason,
                requestId,
              }).catch(() => {});
              retryCount++;
              continue;
            } else {
              // On last retry, still return the response but log the validation failure
              Logger.error(`Response validation failed after ${retryCount + 1} attempts`, {
                requestId,
                errors: validationResult.errors,
              });
              throw new ValidationError('Response validation failed', validationResult.errors);
            }
          }
        }

        saveStuff('FinishedPrompts', {
          request,
          requestId,
          response,
          processedResponse,
        }).catch(() => {});
        return processedResponse;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        Logger.error(`AI request failed on attempt ${retryCount + 1}`, {
          requestId,
          error: lastError.message,
          retryCount,
        });
        saveStuff('FailedPrompts', {
          prompt: request.prompt,
          error,
          message: error instanceof Error ? error.toString() || error.message : undefined,
          reason,
          requestId,
        }).catch(() => {});

        if (retryCount < this.maxRetries) {
          retryCount++;
          continue;
        } else {
          // Record failed attempt in usage service
          if (userId) {
            this.recordFailedAttempt(userId, reason);
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
  private async processPrompt(
    request: AIRequestModel<any>,
    validationErrors: string[] | undefined,
  ): Promise<string> {
    // Find the first matching processor
    for (const processor of this.promptProcessors) {
      if (processor.canProcess(request)) {
        return await processor.process(request);
      }
    }

    if (validationErrors) {
      const errorMessages = validationErrors.join('\n');
      request.prompt = `${request.prompt}\n\nValidation Errors, Make sure to fix these:\n${errorMessages}`;
    }
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

  // Add a private method to record usage by reason asynchronously (fire and forget)
  private recordUsage(
    userId: string,
    reason: string,
    clientId: string,
    promptTokens: number,
    completionTokens: number,
    responseTime: number,
  ): void {
    // Execute without awaiting to make it fire and forget
    this.usageService
      .recordUsageByReason(userId, reason, clientId, promptTokens, completionTokens, responseTime)
      .catch(error => {
        Logger.error(`Failed to record usage by reason (fire and forget)`, {
          error,
          userId,
          reason,
        });
      });

    this.usageService
      .recordUsage(userId, clientId, promptTokens, completionTokens, responseTime)
      .catch(error => {
        Logger.error(`Failed to record usage`, {
          error,
          userId,
          clientId,
          promptTokens,
          completionTokens,
        });
      });
  }

  private recordFailedAttempt(userId: string, reason: string): void {
    // Execute without awaiting to make it fire and forget
    this.usageService.recordFailedAttemptByReason(userId, reason).catch(error => {
      Logger.error(`Failed to record failed attempt by reason (fire and forget)`, {
        error,
        userId,
        reason,
      });
    });

    this.usageService.recordFailedAttempt(userId).catch(error => {
      Logger.error(`Failed to record failed attempt`, {
        error,
        userId,
      });
    });
  }
}
