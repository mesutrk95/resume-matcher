import { BaseActivityDispatcher } from './base-dispatcher';
import { ActivityMessage, DispatcherConfig, MessageLevel } from './types';

export class ConsoleActivityDispatcher extends BaseActivityDispatcher {
  constructor(config?: Partial<DispatcherConfig>) {
    super(config);
  }

  async sendMessage(message: ActivityMessage): Promise<boolean> {
    try {
      const formattedMessage = this.formatMessage(message);
      this.logToConsole(message.level, formattedMessage);
      return true;
    } catch (error) {
      console.error(`Error logging message to console: ${error}`);
      return false;
    }
  }

  private formatMessage(message: ActivityMessage): string {
    const timestamp = message.timestamp.toISOString();
    const level = message.level;

    let formattedMessage = `[${timestamp}] ${level}: ${message.content}`;

    // Add metadata if present
    if (message.metadata && Object.keys(message.metadata).length > 0) {
      const metadataStr = Object.entries(message.metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      formattedMessage += ` (${metadataStr})`;
    }

    return formattedMessage;
  }

  private logToConsole(level: MessageLevel, message: string): void {
    switch (level) {
      case MessageLevel.INFO:
        console.info(message);
        break;
      case MessageLevel.WARNING:
        console.warn(message);
        break;
      case MessageLevel.CRITICAL:
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }
}
