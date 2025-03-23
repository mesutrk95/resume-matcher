// lib/ai/types.ts
export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  timeout?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIResponse {
  content: string;
  model: string;
  tokenUsage: TokenUsage;
  finishReason?: string;
  requestId?: string;
}

export type ContentType = 'text' | 'image' | 'pdf' | 'audio' | 'video';

export interface AIModelClient {
  generateContent(
    prompt: string,
    contents?: ContentItem[],
    options?: AIRequestOptions,
  ): Promise<AIResponse>;

  calculateTokens(text: string): number;

  getModelInfo(): {
    provider: string;
    model: string;
    maxTokens: number;
    costPer1KInputTokens: number;
    costPer1KOutputTokens: number;
  };
}

export type ResponseFormat = 'text' | 'json' | 'html';

export interface ContentItem {
  type: ContentType;
  data: string | Buffer;
  mimeType?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export type Validator<T> = (data: T) => ValidationResult;

export interface AIRequestModel<TResponse = any> {
  prompt: string;
  responseFormat: ResponseFormat;
  contents?: ContentItem[];

  responseValidator?: Validator<TResponse>;

  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
    timeout?: number;
    provider?: string;
    model?: string;
  };

  context?: {
    userId?: string;
    requestId?: string;
  };
}
