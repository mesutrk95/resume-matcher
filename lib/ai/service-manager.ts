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
    const { requestId, userId, reason, isChatRequest, responseValidator } =
      await this._initializeRequestParameters(request);
    request.responseValidator = responseValidator; // Ensure request object has the validator

    await this.checkPreExecutionConditions(userId, request);

    const client = this.getClientForRequest(request);
    let retryCount = 0;
    let lastError: Error | null = null;
    let currentValidationErrors: string[] | undefined;

    while (retryCount <= this.maxRetries) {
      try {
        const attemptResult = await this.executeSingleAIAttempt(
          request,
          client,
          isChatRequest,
          currentValidationErrors,
          requestId,
          userId,
          reason,
        );

        if (attemptResult.success) {
          return attemptResult.processedResponse as T;
        } else {
          // Validation failed
          currentValidationErrors = attemptResult.validationErrors;
          if (retryCount >= this.maxRetries) {
            // This was the last attempt, and it still failed validation
            Logger.error(`Response validation failed after ${retryCount + 1} attempts`, {
              requestId,
              errors: currentValidationErrors,
            });
            throw new ValidationError(
              'Response validation failed after max retries',
              currentValidationErrors,
            );
          } else {
            // Log warning and prepare for retry
            Logger.warn(`Response validation failed on attempt ${retryCount + 1}`, {
              requestId,
              errors: currentValidationErrors,
            });
            retryCount++;
            continue;
          }
        }
      } catch (error) {
        // Catch errors from _executeSingleAIAttempt (e.g., client errors)
        // or the ValidationError thrown above if it's the last validation attempt.
        if (error instanceof ValidationError) {
          // If it's the validation error from the last attempt, rethrow
          lastError = error;
          throw error;
        }
        lastError = error instanceof Error ? error : new Error(String(error));
        // Ensure lastError is not null before passing
        if (lastError) {
          this.logFailedAttempt(request, lastError, requestId, reason, retryCount);
        }

        if (retryCount < this.maxRetries) {
          retryCount++;
          continue;
        } else {
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

    // This should never be reached due to the throw in the catch block or successful return
    throw new AIServiceError('Unexpected execution path in AI service', {
      cause: lastError,
    });
  }

  private async _initializeRequestParameters<T>(request: AIRequestModel<T>) {
    // If zodSchema is provided, create a validator from it
    let responseValidator = request.responseValidator;
    if (request.zodSchema && !responseValidator) {
      responseValidator = createJsonSchemaValidator(request.zodSchema);
    }

    const requestId = request.context?.requestId || (await getCurrentRequestId());
    const userId = request.context?.userId || (await currentUser())?.id;
    const reason = request.context?.reason || Reasons.GENERAL;
    const isChatRequest = !!(request.chatHistory && request.chatHistory.length > 0);

    return { requestId, userId, reason, isChatRequest, responseValidator };
  }

  private async checkPreExecutionConditions<T>(
    userId: string | undefined,
    request: AIRequestModel<T>,
  ): Promise<void> {
    if (userId) {
      // Check token usage limits
      const canProceed = await this.usageService.checkIntent(userId);
      if (!canProceed) {
        throw new TokenLimitExceededError('Token usage limit exceeded');
      }

      // Check rate limits if rate limit service is provided
      if (this.rateLimitService) {
        const client = this.getClientForRequest(request); // Assuming getClientForRequest is synchronous or cheap
        const clientId = client.getClientId();
        const rateLimitCheck = await this.rateLimitService.checkRateLimit(userId, clientId);
        if (!rateLimitCheck.allowed) {
          throw new RateLimitExceededError(rateLimitCheck.reason || 'Rate limit exceeded');
        }
      }
    }
  }

  private logFailedAttempt<T>(
    request: AIRequestModel<T>,
    errorToLog: Error, // Changed parameter name for clarity
    requestId: string,
    reason: string,
    retryCount: number,
  ) {
    Logger.error(`AI request failed on attempt ${retryCount + 1}`, {
      requestId,
      error: errorToLog.message,
      retryCount,
    });
    saveStuff('FailedPrompts', {
      prompt: request.prompt,
      error: errorToLog,
      message: errorToLog.toString(), // errorToLog is guaranteed to be an Error instance
      reason,
      requestId,
    }).catch(() => {});
  }

  private async executeSingleAIAttempt<T>(
    request: AIRequestModel<T>,
    client: AIModelClient,
    isChatRequest: boolean,
    currentValidationErrors: string[] | undefined,
    requestId: string,
    userId: string | undefined,
    reason: string,
  ): Promise<{
    success: boolean;
    processedResponse?: T;
    validationErrors?: string[];
    error?: Error;
  }> {
    let responsePayload;
    const startTime = performance.now();

    if (isChatRequest) {
      responsePayload = await client.generateChatContent(
        request.chatHistory!,
        request.systemInstruction,
        request.options,
      );
    } else {
      const processedPrompt = await this.processPrompt(request, currentValidationErrors);
      responsePayload = await client.generateContent(
        processedPrompt,
        request.systemInstruction,
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
        responsePayload.tokenUsage.promptTokens,
        responsePayload.tokenUsage.completionTokens,
        responseTime,
      );
      if (this.rateLimitService) {
        await this.rateLimitService.recordRequest(userId, client.getClientId());
      }
    }

    const processedResponse = await this.processResponse(responsePayload.content, request);

    if (request.responseValidator) {
      const validationResult = request.responseValidator(processedResponse);
      if (!validationResult.valid) {
        Logger.warn(`Response validation failed on attempt`, {
          // Retry count handled by caller
          requestId,
          errors: validationResult.errors,
        });
        saveStuff('FailedValidationPrompts', {
          prompt: request.prompt,
          processedResponse,
          response: responsePayload,
          validationResult,
          reason,
          requestId,
        }).catch(() => {});
        // Signal validation failure; the main loop decides if it's the absolute last attempt.
        return { success: false, validationErrors: validationResult.errors };
      }
    }

    saveStuff('FinishedPrompts', {
      request,
      requestId,
      response: responsePayload,
      processedResponse,
    }).catch(() => {});
    return { success: true, processedResponse };
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
