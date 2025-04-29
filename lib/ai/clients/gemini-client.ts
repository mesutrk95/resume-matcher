import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIModelClient,
  AIRequestOptions,
  AIResponse,
  ContentItem,
  ChatHistoryItem,
  MessagePart,
} from '../types';
import Logger from '@/lib/logger';

export class GeminiClient implements AIModelClient {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateContent(
    prompt: string,
    contents?: ContentItem[],
    options?: AIRequestOptions,
  ): Promise<AIResponse> {
    try {
      // Create the generation config for the model
      const generationConfig = {
        maxOutputTokens: options?.maxTokens,
        temperature: options?.temperature,
        topP: options?.topP,
        stopSequences: options?.stopSequences,
      };

      // Get the model with generation config
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        generationConfig,
      });

      // Transform content items to Gemini-specific format
      const geminiContents = [
        { text: prompt },
        ...(contents || []).map(item => this.transformContentItem(item)),
      ].filter(Boolean);

      // Create request options with timeout
      const requestOptions = options?.timeout
        ? {
            timeout: options.timeout,
          }
        : undefined;

      // Generate content
      const result = await model.generateContent(geminiContents, requestOptions);
      const response = result.response;
      const text = response.text();

      // Calculate token usage
      let totalPromptText = prompt;
      contents?.forEach(item => {
        if (item.type === 'text' && typeof item.data === 'string') {
          totalPromptText += item.data;
        }
      });

      const promptTokens = this.calculateTokens(totalPromptText);
      const completionTokens = this.calculateTokens(text);

      return {
        content: text,
        model: this.modelName,
        tokenUsage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        finishReason: response.promptFeedback?.blockReason || 'stop',
      };
    } catch (error) {
      Logger.error('Gemini API error:', error);
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async generateChatContent(
    history: ChatHistoryItem[],
    systemInstruction?: string,
    options?: AIRequestOptions,
  ): Promise<AIResponse> {
    try {
      const generationConfig = {
        maxOutputTokens: options?.maxTokens,
        temperature: options?.temperature,
        topP: options?.topP,
        stopSequences: options?.stopSequences,
      };

      // Get the model with generation config and system instruction
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        generationConfig,
        systemInstruction,
      });

      // Convert our custom history format to Google's Content format
      const formattedHistory = history.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => this.ensureValidPart(part)),
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      // Get the latest user message
      const lastMessage = history[history.length - 1];

      // Ensure the parts are valid for Google's API
      const messageParts = lastMessage.parts.map(part => this.ensureValidPart(part));

      // Send the message
      const result = await chat.sendMessage(messageParts);
      const text = result.response.text();

      // Calculate token usage (approximate)
      const historyText = history
        .map(msg =>
          msg.parts
            .map(part => {
              if ('text' in part && part.text) return part.text;
              return '';
            })
            .join(' '),
        )
        .join(' ');

      const promptTokens = this.calculateTokens(historyText);
      const completionTokens = this.calculateTokens(text);

      return {
        content: text,
        model: this.modelName,
        tokenUsage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        finishReason: 'stop',
      };
    } catch (error) {
      Logger.error('Gemini Chat API error:', error);
      throw new Error(
        `Gemini Chat API error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Ensure the part is valid for Google's API
  private ensureValidPart(part: MessagePart): any {
    // If it's already a valid Part object with only text or inlineData
    if (
      typeof part === 'object' &&
      (('text' in part && typeof part.text === 'string') ||
        ('inlineData' in part && typeof part.inlineData === 'object')) &&
      Object.keys(part).length <= 1
    ) {
      return part;
    }

    // If it's a string, convert to text part
    if (typeof part === 'string') {
      return { text: part };
    }

    // For our custom format, extract the relevant properties
    if (typeof part === 'object') {
      if ('text' in part && part.text) {
        return { text: part.text };
      }

      if ('inlineData' in part && part.inlineData) {
        return {
          inlineData: {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          },
        };
      }
    }

    // Fallback
    Logger.warn('Invalid part format, converting to empty text', { part });
    return { text: '' };
  }

  private transformContentItem(item: ContentItem): any | null {
    try {
      switch (item.type) {
        case 'text':
          return { text: item.data.toString() };

        case 'image':
        case 'pdf':
        case 'audio':
        case 'video': {
          const data = Buffer.isBuffer(item.data) ? item.data.toString('base64') : item.data;

          return {
            inlineData: {
              data: data.toString(),
              mimeType: item.mimeType || this.getMimeTypeForContentType(item.type),
            },
          };
        }

        default:
          Logger.warn(`Unsupported content type: ${item.type}`);
          return null;
      }
    } catch (error) {
      Logger.error('Error transforming content item', { error, item });
      return null;
    }
  }

  private getMimeTypeForContentType(type: string): string {
    switch (type) {
      case 'image':
        return 'image/jpeg';
      case 'pdf':
        return 'application/pdf';
      case 'audio':
        return 'audio/mpeg';
      case 'video':
        return 'video/mp4';
      default:
        return 'application/octet-stream';
    }
  }

  calculateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  getModelInfo() {
    return {
      provider: 'Google',
      model: this.modelName,
      maxTokens: this.modelName.includes('pro') ? 32768 : 8192,
      costPer1KInputTokens: 0.00025,
      costPer1KOutputTokens: 0.00125,
    };
  }

  getClientId(): string {
    return `google-${this.modelName}`;
  }

  getClientName(): string {
    return `Google ${this.modelName}`;
  }
}
