// lib/ai/errors.ts

/**
 * Base class for AI service errors
 */
export class AIServiceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AIServiceError';
  }
}

/**
 * Error thrown when token limits are exceeded
 */
export class TokenLimitExceededError extends AIServiceError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TokenLimitExceededError';
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AIServiceError {
  public readonly errors?: string[];

  constructor(message: string, errors?: string[], options?: ErrorOptions) {
    super(message, options);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Error thrown when an AI request fails due to API issues
 */
export class AIRequestError extends AIServiceError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AIRequestError';
  }
}

/**
 * Error thrown when response processing fails
 */
export class ResponseProcessingError extends AIServiceError {
  public readonly content: string;
  constructor(message: string, content: string, options?: ErrorOptions) {
    super(message, options);
    this.content = content;
    this.name = 'ResponseProcessingError';
  }
}

/**
 * Error thrown when prompt processing fails
 */
export class PromptProcessingError extends AIServiceError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PromptProcessingError';
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitExceededError extends AIServiceError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RateLimitExceededError';
  }
}
