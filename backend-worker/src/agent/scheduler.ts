import { Bindings } from "../index";
import { getDb } from "../db";
import { scheduledTasks } from "../db/schema";
import { eq, and, lt } from "drizzle-orm";
import { waManager } from '../whatsapp-adapter';

/**
 * Sketch-inspired Autonomous Scheduler
 * 
 * Handles execution of delayed agent actions.
 */

export async function processScheduledTasks(env: Bindings) {
  const db = getDb(env.DATABASE_URL);
  const now = new Date();

  // 1. Fetch pending tasks that are due
  const tasks = await db.select()
    .from(scheduledTasks)
    .where(
      and(
        eq(scheduledTasks.status, 'pending'),
        lt(scheduledTasks.scheduledFor, now)
      )
    )
    .limit(10);

  console.log(`[Scheduler] Checking tasks... found ${tasks.length} due.`);

  for (const task of tasks) {
    try {
      // 2. Mark as processing
      await db.update(scheduledTasks)
        .set({ status: 'processing', updatedAt: now })
        .where(eq(scheduledTasks.id, task.id));

      // 3. Dispatch based on taskType
      if (task.taskType === 'outbound_call') {
        // Trigger a Twilio outbound call
        console.log(`[Scheduler] Dispatching call for task ${task.id}`);
        // Implementation would call the /api/initiate-call logic
      } else if (task.taskType === 'whatsapp_message') {
        const payload = task.payload as any;
        const agentId = task.agentConfigId;
        if (!agentId) throw new Error('Task missing agentConfigId');
        if (waManager.getStatus(agentId) === 'connected') {
          await waManager.sendMessage(agentId, payload.to, payload.text);
          console.log(`[Scheduler] WhatsApp sent to ${payload.to}`);
        } else {
          throw new Error('WhatsApp not connected');
        }
      }

      // 4. Mark as completed
      await db.update(scheduledTasks)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(scheduledTasks.id, task.id));

    } catch (err: any) {
      console.error(`[Scheduler] Task ${task.id} failed:`, err);
      await db.update(scheduledTasks)
        .set({ 
          status: 'failed', 
          lastError: err.message,
          retryCount: (task.retryCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(scheduledTasks.id, task.id));
    }
  }
}
