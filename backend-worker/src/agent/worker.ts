import { getDb } from '../db';
import { scheduledTasks, agentConfigurations, agentContacts } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { Bindings } from '../index';

/**
 * Background Task Worker
 * Polls the database for pending scheduled tasks and executes them.
 * Ensures agents stay "persistent" and continue working even when users are offline.
 */
export class TaskWorker {
  private dbUrl: string;
  private env: Bindings;
  private interval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(dbUrl: string, env: Bindings) {
    this.dbUrl = dbUrl;
    this.env = env;
  }

  start(intervalMs: number = 30000) {
    console.log(`[Worker] Starting background task processor (polling every ${intervalMs}ms)`);
    this.interval = setInterval(() => this.processTasks(), intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async processTasks() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const db = getDb(this.dbUrl);
      const now = new Date();

      // Find pending tasks scheduled for now or in the past
      const tasks = await db.select()
        .from(scheduledTasks)
        .where(
          and(
            eq(scheduledTasks.status, 'pending'),
            lt(scheduledTasks.scheduledFor, now)
          )
        )
        .limit(10);

      if (tasks.length > 0) {
        console.log(`[Worker] Found ${tasks.length} pending tasks to process`);
      }

      for (const task of tasks) {
        await this.executeTask(task);
      }
    } catch (error) {
      console.error('[Worker] Error polling tasks:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeTask(task: any) {
    const db = getDb(this.dbUrl);
    console.log(`[Worker] Executing task ${task.id} (${task.taskType})`);

    try {
      // Mark as processing
      await db.update(scheduledTasks)
        .set({ status: 'processing', updatedAt: new Date() })
        .where(eq(scheduledTasks.id, task.id));

      switch (task.taskType) {
        case 'outbound_call':
          await this.handleOutboundCall(task);
          break;
        case 'whatsapp_message':
          await this.handleWhatsAppMessage(task);
          break;
        default:
          console.warn(`[Worker] Unknown task type: ${task.taskType}`);
      }

      // Mark as completed
      await db.update(scheduledTasks)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(scheduledTasks.id, task.id));

    } catch (error: any) {
      console.error(`[Worker] Task ${task.id} failed:`, error);
      await db.update(scheduledTasks)
        .set({ 
          status: 'failed', 
          lastError: error.message,
          retryCount: (task.retryCount || 0) + 1,
          updatedAt: new Date() 
        })
        .where(eq(scheduledTasks.id, task.id));
    }
  }

  private async handleOutboundCall(task: any) {
    // Logic to trigger Twilio outbound call
    // This would use the Twilio client to initiate a call to task.payload.phoneNumber
    console.log(`[Worker] Initiating outbound call to ${task.payload.phoneNumber}`);
    // In a real implementation, we would call Twilio API here
  }

  private async handleWhatsAppMessage(task: any) {
    // Logic to send WhatsApp message via Baileys or Official API
    console.log(`[Worker] Sending WhatsApp to ${task.payload.phoneNumber}`);
  }
}
