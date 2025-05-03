export function loadTelegramConfig() {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    environment: process.env.NODE_ENV || process.env.APP_ENV || 'production',
    rateLimitPerMinute: parseInt(process.env.ACTIVITY_RATE_LIMIT_PER_MINUTE || '20', 10),
    maxRetries: parseInt(process.env.ACTIVITY_MAX_RETRIES || '3', 10),
    retryDelayMs: parseInt(process.env.ACTIVITY_RETRY_DELAY_MS || '1000', 10),
  };
}
