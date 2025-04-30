// lib/ai/index.ts
import { AIRequestModel, ContentItem, ResponseFormat, AIRequestOptions } from './types';
import { GeminiClient } from './clients/gemini-client';
import { AIServiceManager } from './service-manager';
import { AIUsageService } from './usage-service';
import { AIRateLimitService } from './rate-limit-service';
import { createStandardPromptProcessors } from './promptProcessors';
import { createStandardResponseProcessors } from './responseProcessors';
import { getCurrentRequestId } from '@/lib/request-context';
import { currentUser } from '@/lib/auth';
import Logger from '@/lib/logger';
import { AI } from '@/lib/constants';
import { randomNDigits } from '@/lib/utils';
import { MessagePart, ChatHistoryItem } from './types';

// Singleton instance of the AI service manager
let _serviceManager: AIServiceManager | null = null;

/**
 * Factory function to create and configure the AI service manager
 */
export function createAIServiceManager(): AIServiceManager {
  if (_serviceManager) {
    return _serviceManager;
  }
  // Create the services
  const usageService = new AIUsageService();
  const rateLimitService = new AIRateLimitService();

  // Create the default clients
  const geminiClient = new GeminiClient(
    process.env.GEMINI_API_KEY || '',
    process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  );

  const promptProcessors = createStandardPromptProcessors(AI.SYSTEM_CONTEXT);
  const responseProcessors = createStandardResponseProcessors();

  // Create and configure the service manager
  _serviceManager = new AIServiceManager({
    maxRetries: AI.MAX_RETRIES,
    defaultClient: geminiClient,
    promptProcessors,
    responseProcessors,
    usageService,
    rateLimitService,
  });

  return _serviceManager;
}
/**
 * Helper function to get JSON response from AI
 */
export async function getAIJsonResponse(
  prompt: string,
  contents?: (string | Buffer)[],
  systemInstructions?: string,
): Promise<{
  result: any;
  error?: string;
  prompt: string;
  content?: (string | Buffer)[];
}> {
  return processAIRequest<any>({
    prompt,
    responseFormat: 'json',
    contents: contents?.map(c => ({
      type: typeof c === 'string' ? 'text' : 'pdf',
      data: c,
    })),
    systemInstruction: systemInstructions,
  });
}

/**
 * Process an AI request with error handling
 */
async function processAIRequest<T>(request: {
  prompt: string;
  responseFormat: ResponseFormat;
  contents?: ContentItem[];
  options?: AIRequestOptions;
  systemInstruction?: string;
}): Promise<{
  result: T;
  error?: string;
  prompt: string;
  content?: (string | Buffer)[];
}> {
  try {
    // Get the service manager
    const serviceManager = createAIServiceManager();

    // Get current user ID if available (for usage tracking)
    const user = await currentUser().catch(() => null);
    const userId = user?.id;

    // Get request ID for tracking
    const requestId = await getCurrentRequestId();

    // Create the request model
    const requestModel: AIRequestModel<T> = {
      prompt: request.prompt,
      responseFormat: request.responseFormat,
      contents: request.contents,
      options: request.options,
      systemInstruction: request.systemInstruction,
      context: {
        userId,
        requestId,
      },
    };

    // Execute the request
    const result = await serviceManager.executeRequest<T>(requestModel);

    // Return successful result
    return {
      result,
      prompt: request.prompt,
      content: request.contents?.map(c => c.data),
    };
  } catch (error) {
    Logger.error('AI request failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    // Return error information
    return {
      result: null as unknown as T,
      error: error instanceof Error ? error.message : String(error),
      prompt: request.prompt,
      content: request.contents?.map(c => c.data),
    };
  }
}

/**
 * Helper function to get chat response from Gemini
 * @param systemInstruction System instruction for the model
 * @param messages Array of message parts to send
 * @param instructionSuffix Optional instruction to append (not saved to history)
 * @param history Optional chat history
 * @returns Response text and updated history
 */
export async function getChatResponse(
  systemInstruction: string,
  messages: MessagePart[],
  instructionSuffix: string | null,
  history?: ChatHistoryItem[],
): Promise<{
  response: string;
  updatedHistory: ChatHistoryItem[];
}> {
  try {
    // Get the service manager
    const serviceManager = createAIServiceManager();

    // Prepare the history (without any instructions)
    const geminiHistory =
      history?.map(item => ({
        role: item.role,
        parts: item.parts,
        id: item.id,
        timestamp: item.timestamp,
      })) || [];

    // Get current user ID if available (for usage tracking)
    const user = await currentUser().catch(() => null);
    const userId = user?.id;

    // Get request ID for tracking
    const requestId = await getCurrentRequestId();

    // Create a new user message for the current request
    const currentUserMessage = {
      role: 'user' as const,
      parts: messages,
    } as ChatHistoryItem;

    // Add the current message to the history for the request
    const updatedHistory = [...geminiHistory, currentUserMessage];

    // Create the request model for chat
    const requestModel: AIRequestModel<string> = {
      prompt: instructionSuffix || '', // Use instruction suffix as prompt if provided
      responseFormat: 'text',
      chatHistory: updatedHistory,
      systemInstruction,
      options: {
        temperature: 0.7, // Standard temperature for chat
      },
      context: {
        userId,
        requestId,
      },
    };

    // Execute the request using the service manager
    const responseText = await serviceManager.executeRequest<string>(requestModel);

    // Create a proper ContentWithMeta for the user message (with ID and timestamp)
    const newUserMessage: ChatHistoryItem = {
      id: randomNDigits(),
      timestamp: new Date(),
      role: 'user',
      parts: messages, // Original parts without instruction
    };

    // Create the model response message
    const newModelMessage: ChatHistoryItem = {
      id: randomNDigits(),
      timestamp: new Date(),
      role: 'model',
      parts: [{ text: responseText }],
    };

    // Return the response and updated history
    return {
      response: responseText,
      updatedHistory: [...(history || []), newUserMessage, newModelMessage],
    };
  } catch (error) {
    Logger.error('Gemini chat request failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

// Export types and classes for direct use
export * from './types';
export * from './errors';
export * from './service-manager';
export * from './usage-service';
export * from './clients/gemini-client';
export * from './rate-limit-service';
export * from './init-rate-limits';
export * from './manage-rate-limits';
