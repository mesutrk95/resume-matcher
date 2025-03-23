import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIModelClient,
  AIRequestOptions,
  AIResponse,
  ContentItem,
} from '../types';

export class GeminiClient implements AIModelClient {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-1.5-pro') {
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
      ];

      // Create request options with timeout
      const requestOptions = options?.timeout
        ? {
            timeout: options.timeout,
          }
        : undefined;

      // Generate content
      const result = await model.generateContent(
        geminiContents,
        requestOptions,
      );
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
      console.error('Gemini API error:', error);
      throw new Error(
        `Gemini API error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private transformContentItem(item: ContentItem): any {
    switch (item.type) {
      case 'text':
        return { text: item.data.toString() };

      case 'image':
      case 'pdf':
      case 'audio':
      case 'video':
        const data = Buffer.isBuffer(item.data)
          ? item.data.toString('base64')
          : item.data;

        return {
          inlineData: {
            data,
            mimeType:
              item.mimeType || this.getMimeTypeForContentType(item.type),
          },
        };

      default:
        throw new Error(`Unsupported content type: ${item.type}`);
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
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  getModelInfo() {
    return {
      provider: 'Google',
      model: this.modelName,
      maxTokens: this.modelName.includes('pro') ? 32768 : 8192,
      costPer1KInputTokens: 0.00025, // Example rate
      costPer1KOutputTokens: 0.00125, // Example rate
    };
  }
}
