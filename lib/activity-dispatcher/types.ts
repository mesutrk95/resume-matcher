export enum MessageLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface ActivityMessage {
  level: MessageLevel;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DispatcherConfig {
  rateLimitPerMinute: number;
  maxRetries: number;
  retryDelayMs: number;
}

export interface ActivityDispatcher {
  // Core method
  dispatchActivity(message: ActivityMessage): Promise<boolean>;

  // Convenience methods
  dispatchInfo(content: string, metadata?: Record<string, any>): Promise<boolean>;
  dispatchWarning(content: string, metadata?: Record<string, any>): Promise<boolean>;
  dispatchCritical(content: string, metadata?: Record<string, any>): Promise<boolean>;
}
