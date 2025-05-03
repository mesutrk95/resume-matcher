import { BaseActivityDispatcher } from './base-dispatcher';
import { ActivityMessage, DispatcherConfig } from './types';
import { RateLimiter } from './rate-limiter';
import { MessageQueue } from './message-queue';

interface TelegramConfig extends Partial<DispatcherConfig> {
  botToken: string;
  chatId: string;
  environment?: string;
}

export class TelegramActivityDispatcher extends BaseActivityDispatcher {
  private rateLimiter: RateLimiter;
  private messageQueue: MessageQueue;
  private telegramConfig: TelegramConfig;
  private environment: string;

  constructor(config: TelegramConfig) {
    super(config);
    this.telegramConfig = config;
    this.rateLimiter = new RateLimiter(this.config.rateLimitPerMinute);
    this.messageQueue = new MessageQueue();

    this.environment = config.environment || process.env.NODE_ENV || 'production';

    this.messageQueue.setProcessingFunction(this.processQueueItem.bind(this));
  }

  async sendMessage(message: ActivityMessage): Promise<boolean> {
    return this.messageQueue.enqueue(message);
  }

  private async processQueueItem(message: ActivityMessage, attempts: number): Promise<boolean> {
    // Check rate limit
    await this.rateLimiter.acquire();

    // Check retry limit
    if (attempts >= this.config.maxRetries) {
      console.error(`Failed to send message after ${attempts} attempts: ${message.content}`);
      return false;
    }

    try {
      const formattedMessage = this.formatMessage(message);
      await this.sendToTelegram(formattedMessage);
      return true;
    } catch (error) {
      console.error(`Error sending message to Telegram (attempt ${attempts + 1}): ${error}`);

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs));
      return false;
    }
  }

  private formatMessage(message: ActivityMessage): string {
    const timestamp = message.timestamp.toISOString();
    const level = message.level;

    let emoji = 'ℹ️';
    if (level === 'WARNING') emoji = '⚠️';
    if (level === 'CRITICAL') emoji = '🚨';

    let formattedMessage = `*[${this.environment.toUpperCase()}]* ${emoji} *${level}* [${timestamp}]\n${message.content}`;

    // Add metadata if present
    if (message.metadata && Object.keys(message.metadata).length > 0) {
      const metadataStr = Object.entries(message.metadata)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');

      formattedMessage += `\n\n*Details:*\n${metadataStr}`;
    }

    return formattedMessage;
  }

  private async sendToTelegram(message: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.telegramConfig.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: this.telegramConfig.chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }
  }
}
