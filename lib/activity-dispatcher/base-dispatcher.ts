import { ActivityDispatcher, ActivityMessage, DispatcherConfig, MessageLevel } from './types';

export abstract class BaseActivityDispatcher implements ActivityDispatcher {
  protected config: DispatcherConfig;

  constructor(config?: Partial<DispatcherConfig>) {
    this.config = {
      rateLimitPerMinute: 20, // Default Telegram limit
      maxRetries: 3,
      retryDelayMs: 1000,
      ...config,
    };
  }

  abstract sendMessage(message: ActivityMessage): Promise<boolean>;

  async dispatchActivity(message: ActivityMessage): Promise<boolean> {
    try {
      return await this.sendMessage(message);
    } catch (error) {
      console.error(`Failed to dispatch activity: ${error}`);
      return false;
    }
  }

  async dispatchInfo(content: string, metadata?: Record<string, any>): Promise<boolean> {
    return this.dispatchActivity({
      level: MessageLevel.INFO,
      content,
      timestamp: new Date(),
      metadata,
    });
  }

  async dispatchWarning(content: string, metadata?: Record<string, any>): Promise<boolean> {
    return this.dispatchActivity({
      level: MessageLevel.WARNING,
      content,
      timestamp: new Date(),
      metadata,
    });
  }

  async dispatchCritical(content: string, metadata?: Record<string, any>): Promise<boolean> {
    return this.dispatchActivity({
      level: MessageLevel.CRITICAL,
      content,
      timestamp: new Date(),
      metadata,
    });
  }
}
