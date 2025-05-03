// lib/activity-dispatcher/rate-limiter.ts
export class RateLimiter {
  private messagesInWindow: number = 0;
  private windowStart: number;
  private readonly windowSizeMs: number = 60000; // 1 minute in milliseconds
  private readonly maxMessagesPerWindow: number;

  constructor(messagesPerMinute: number) {
    this.maxMessagesPerWindow = messagesPerMinute;
    this.windowStart = Date.now();
  }

  async acquire(): Promise<boolean> {
    const now = Date.now();

    // Reset window if needed
    if (now - this.windowStart > this.windowSizeMs) {
      this.messagesInWindow = 0;
      this.windowStart = now;
    }

    // Check if we're at the limit
    if (this.messagesInWindow >= this.maxMessagesPerWindow) {
      // Calculate time to wait until next window
      const timeToWait = this.windowSizeMs - (now - this.windowStart);

      if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
        // Recursive call after waiting
        return this.acquire();
      }

      // Reset window after waiting
      this.messagesInWindow = 0;
      this.windowStart = Date.now();
    }

    // Increment counter and return
    this.messagesInWindow++;
    return true;
  }
}
