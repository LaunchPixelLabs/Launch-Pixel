import { getDb } from '../db';
import { scheduledTasks, agentConfigurations, agentContacts } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { Bindings } from '../index';
import { analyzeCallAndScoreLead } from './analysis';

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
        case 'lead_analysis':
          await this.handleLeadAnalysis(task);
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
    const { phoneNumber, agentId } = task.payload;
    if (!phoneNumber || !agentId) throw new Error("Missing phoneNumber or agentId in payload");

    console.log(`[Worker] Initiating outbound call to ${phoneNumber} using agent ${agentId}`);

    const db = getDb(this.dbUrl);
    const agent = await db.query.agentConfigurations.findFirst({
      where: eq(agentConfigurations.id, agentId)
    });

    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const auth = btoa(`${this.env.TWILIO_ACCOUNT_SID}:${this.env.TWILIO_AUTH_TOKEN}`);
    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.env.TWILIO_ACCOUNT_SID}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: agent.assignedPhoneNumber || this.env.TWILIO_PHONE_NUMBER,
        To: phoneNumber,
        Url: `${this.env.WORKER_BASE_URL || 'http://localhost:3000'}/api/call/twiml?agentId=${agentId}`
      })
    });

    const data = await twilioRes.json() as any;
    if (!twilioRes.ok) {
      throw new Error(data.message || 'Twilio Outbound Call Failed');
    }

    console.log(`[Worker] Call initiated successfully. SID: ${data.sid}`);
    
    // Update contact status to "Called"
    await db.update(agentContacts)
      .set({ status: 'Called', updatedAt: new Date() })
      .where(and(eq(agentContacts.phoneNumber, phoneNumber), eq(agentContacts.userId, agent.userId)));
  }

  private async handleWhatsAppMessage(task: any) {
    const { phoneNumber, agentId, message } = task.payload;
    if (!phoneNumber || !agentId) throw new Error("Missing phoneNumber or agentId in payload");

    console.log(`[Worker] Sending WhatsApp to ${phoneNumber}`);

    const db = getDb(this.dbUrl);
    const agent = await db.query.agentConfigurations.findFirst({
      where: eq(agentConfigurations.id, agentId)
    });

    if (!agent || !agent.whatsappNumber) throw new Error("WhatsApp not configured for this agent");

    const auth = btoa(`${this.env.TWILIO_ACCOUNT_SID}:${this.env.TWILIO_AUTH_TOKEN}`);
    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: `whatsapp:${agent.whatsappNumber}`,
        To: `whatsapp:${phoneNumber}`,
        Body: message || "Hello! This is your AI assistant."
      })
    });

    if (!twilioRes.ok) {
      const error = await twilioRes.text();
      throw new Error(`WhatsApp Send Failed: ${error}`);
    }
  }

  private async handleLeadAnalysis(task: any) {
    const { callLogId, transcript } = task.payload;
    if (!callLogId || !transcript) throw new Error("Missing callLogId or transcript in analysis payload");

    console.log(`[Worker] Analyzing lead for call log ${callLogId}`);
    await analyzeCallAndScoreLead(this.env, callLogId, transcript);
  }
}
