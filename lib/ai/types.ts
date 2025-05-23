import * as z from 'zod';

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
    systemInstruction?: string,
    contents?: ContentItem[],
    options?: AIRequestOptions,
  ): Promise<AIResponse>;

  // Method for chat support
  generateChatContent(
    history: ChatHistoryItem[],
    systemInstruction?: string,
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

  // Client identifier for rate limiting
  getClientId(): string;

  // Client name for display purposes
  getClientName(): string;
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

// Define our own Part interface instead of importing from Google
export interface MessagePart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export interface ChatHistoryItem {
  role: 'user' | 'model' | 'system';
  parts: MessagePart[];
  id: string;
  timestamp: Date;
}

export interface AIRequestModel<TResponse = any> {
  prompt: string;
  responseFormat: ResponseFormat;
  contents?: ContentItem[];

  chatHistory?: ChatHistoryItem[];
  systemInstruction?: string;

  responseValidator?: Validator<TResponse>;
  zodSchema?: z.ZodType<TResponse>;

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
    reason?: string;
  };
}
