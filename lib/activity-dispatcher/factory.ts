import { ActivityDispatcher } from './types';
import { TelegramActivityDispatcher } from './telegram-dispatcher';
import { ConsoleActivityDispatcher } from './console-dispatcher';
import { loadTelegramConfig } from './config';

// Singleton instance
let dispatcherInstance: ActivityDispatcher | null = null;

export function getActivityDispatcher(): ActivityDispatcher {
  if (dispatcherInstance) {
    return dispatcherInstance;
  }

  const config = loadTelegramConfig();

  if (!config.botToken || !config.chatId) {
    return new ConsoleActivityDispatcher(config);
  }

  return new TelegramActivityDispatcher(config);
}

// Get or create telegram dispatcher
export function getTelegramDispatcher(): ActivityDispatcher {
  if (!dispatcherInstance) {
    const config = loadTelegramConfig();

    if (!config.botToken || !config.chatId) {
      throw new Error('Telegram bot token or chat ID not configured');
    }

    dispatcherInstance = new TelegramActivityDispatcher(config);
  }

  return dispatcherInstance;
}

// Get or create console dispatcher
export function getConsoleDispatcher(): ActivityDispatcher {
  if (!dispatcherInstance) {
    const config = loadTelegramConfig();
    dispatcherInstance = new ConsoleActivityDispatcher(config);
  }

  return dispatcherInstance;
}
