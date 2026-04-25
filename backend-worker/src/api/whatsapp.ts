import { Context } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { agentConfigurations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { runSketchAgent } from '../agent/sketch-runner';
import { waManager } from '../whatsapp-adapter';

/**
 * Handles incoming WhatsApp messages from Twilio.
 * Routes user text to the Claude-powered Sketch brain and replies via WhatsApp.
 */
export async function handleInboundWhatsApp(c: Context<{ Bindings: Bindings }>) {
  const body = await c.req.parseBody();
  const from = body.From as string; // User's WhatsApp number (e.g. whatsapp:+123456789)
  const text = body.Body as string; // User's message
  const to = body.To as string;     // Agent's WhatsApp number (e.g. whatsapp:+198765432)
  
  if (!from || !text || !to) {
    return c.text('Invalid request', 400);
  }

  const db = getDb(c.env.DATABASE_URL);
  
  // 1. Identify the agent handling this WhatsApp number
  const agent = await db.query.agentConfigurations.findFirst({
    where: eq(agentConfigurations.whatsappNumber, to)
  });

  if (!agent || !agent.whatsappEnabled) {
    console.log(`[WhatsApp] No agent found or enabled for ${to}`);
    return c.text('OK', 200);
  }

  try {
    // 2. Execute the AI Brain (Claude + Sketch Tools)
    // For now, we use a stateless interaction. Threading can be added later via DB.
    const result = await runSketchAgent({
      userId: agent.userId,
      systemPrompt: agent.systemPrompt,
      userMessage: text,
      env: c.env,
      onText: (chunk) => {
        // We could stream WhatsApp messages, but Twilio doesn't support it well.
        // We'll wait for the full response.
      }
    });

    // 3. Send the response back via Twilio WhatsApp API
    const auth = btoa(`${c.env.TWILIO_ACCOUNT_SID}:${c.env.TWILIO_AUTH_TOKEN}`);
    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${c.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: to,
        To: from,
        Body: result.text
      })
    });

    if (!twilioRes.ok) {
      const error = await twilioRes.text();
      console.error("[WhatsApp] Twilio Send Error:", error);
    }

    return c.text('OK', 200);

  } catch (error) {
    console.error("[WhatsApp] Brain Execution Error:", error);
    return c.text('Internal Error', 500);
  }
}

/**
 * Proactively sends a WhatsApp message from an agent to a contact.
 * Used for outbound "cold outreach" or "follow-up" automation.
 */
export async function sendOutboundWhatsApp(
  env: Bindings,
  agentId: number,
  toPhone: string,
  message: string
) {
  const db = getDb(env.DATABASE_URL);
  const agent = await db.query.agentConfigurations.findFirst({
    where: eq(agentConfigurations.id, agentId)
  });

  if (!agent || !agent.whatsappNumber || !agent.whatsappEnabled) {
    throw new Error("WhatsApp not configured for this agent.");
  }

  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: `whatsapp:${agent.whatsappNumber}`,
      To: `whatsapp:${toPhone.startsWith('+') ? toPhone : '+' + toPhone}`,
      Body: message
    })
  });

  return twilioRes.ok;
}

/**
 * Retrieves the current Baileys QR code for an agent.
 */
export async function getWhatsAppQR(c: Context<{ Bindings: Bindings }>) {
  const agentId = parseInt(c.req.param('agentId') as string);
  if (isNaN(agentId)) return c.json({ error: 'Invalid agentId' }, 400);

  // Initialize if not already running
  waManager.setEnv(c.env);
  await waManager.initializeAgent(agentId);

  const qr = waManager.getQR(agentId);
  const status = waManager.getStatus(agentId);

  return c.json({ success: true, qr, status });
}

/**
 * Retrieves the current Baileys connection status for an agent.
 */
export async function getWhatsAppStatus(c: Context<{ Bindings: Bindings }>) {
  const agentId = parseInt(c.req.param('agentId') as string);
  if (isNaN(agentId)) return c.json({ error: 'Invalid agentId' }, 400);

  const status = waManager.getStatus(agentId);
  return c.json({ success: true, status });
}

/**
 * Triggers a manual connection/initialization for an agent.
 */
export async function connectWhatsApp(c: Context<{ Bindings: Bindings }>) {
  const agentId = parseInt(c.req.param('agentId') as string);
  if (isNaN(agentId)) return c.json({ error: 'Invalid agentId' }, 400);

  waManager.setEnv(c.env);
  await waManager.initializeAgent(agentId);

  return c.json({ success: true, message: "Connection process initiated" });
}
