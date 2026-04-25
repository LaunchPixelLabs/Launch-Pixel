/**
 * Per-channel in-memory message queue.
 * Ported from Sketch (canvasxai/sketch) — ensures sequential processing,
 * one agent run at a time per channel/agent. Prevents race conditions
 * when multiple saves or tool calls happen simultaneously.
 */

export class ChannelQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  enqueue(work: () => Promise<void>): void {
    this.queue.push(work);
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    const work = this.queue.shift();
    if (!work) {
      this.processing = false;
      return;
    }
    try {
      await work();
    } catch (err) {
      // Errors should be handled inside the work function.
      // This catch prevents unhandled promise rejections from blocking the queue.
      console.error("[Queue] Unhandled error in queue work item:", err);
    } finally {
      this.processing = false;
      this.processNext();
    }
  }

  get pending(): number {
    return this.queue.length;
  }

  get isProcessing(): boolean {
    return this.processing;
  }
}

export class QueueManager {
  private queues = new Map<string, ChannelQueue>();

  getQueue(channelId: string): ChannelQueue {
    let queue = this.queues.get(channelId);
    if (!queue) {
      queue = new ChannelQueue();
      this.queues.set(channelId, queue);
    }
    return queue;
  }

  /** Clean up idle queues to prevent memory leaks */
  cleanup(): void {
    for (const [key, queue] of this.queues.entries()) {
      if (!queue.isProcessing && queue.pending === 0) {
        this.queues.delete(key);
      }
    }
  }
}

// Singleton for the worker
export const globalQueueManager = new QueueManager();
