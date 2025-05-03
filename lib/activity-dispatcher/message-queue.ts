import { ActivityMessage } from './types';

interface QueueItem {
  message: ActivityMessage;
  attempts: number;
  resolve: (success: boolean) => void;
  reject: (error: Error) => void;
}

export class MessageQueue {
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;

  enqueue(message: ActivityMessage): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.queue.push({
        message,
        attempts: 0,
        resolve,
        reject,
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  setProcessingFunction(
    processFn: (message: ActivityMessage, attempts: number) => Promise<boolean>,
  ) {
    this.processingFunction = processFn;
  }

  private processingFunction: (message: ActivityMessage, attempts: number) => Promise<boolean> =
    () => Promise.resolve(false);

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const item = this.queue[0];

    try {
      const success = await this.processingFunction(item.message, item.attempts);

      if (success) {
        // Message processed successfully, remove from queue
        this.queue.shift();
        item.resolve(true);
      } else {
        // Failed to process
        item.attempts++;
        // Move to end of queue for retry
        this.queue.shift();
        this.queue.push(item);
      }
    } catch (error) {
      // Error in processing
      item.attempts++;
      // Move to end of queue for retry
      this.queue.shift();
      this.queue.push(item);
    }

    // Continue processing queue
    setTimeout(() => this.processQueue(), 100);
  }
}
