import makeWASocket, { 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WAMessage,
  proto,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import { transcribeAudio } from './agent/audio';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { useDatabaseAuthState, clearAuthState } from './agent/whatsapp-auth';
import { runSketchAgent } from './agent/sketch-runner';
import { getDb } from './db';
import { agentConfigurations } from './db/schema';
import { eq, sql } from 'drizzle-orm';
import { Bindings } from './index';

/**
 * Production-grade WhatsApp Manager (Baileys)
 * Supports multiple concurrent agent sessions with DB-backed persistence.
 */
export class WhatsAppManager {
  private sessions = new Map<number, any>();
  private qrs = new Map<number, string>();
  private statuses = new Map<number, 'disconnected' | 'connecting' | 'connected'>();
  private env: Bindings | null = null;
  private initLocks = new Set<number>();
  
  // Thread History Buffer (In-memory conversation context)
  private threadHistory = new Map<string, Array<{ role: 'user' | 'assistant', content: string }>>();

  setEnv(env: Bindings) {
    this.env = env;
  }

  private getThreadKey(agentId: number, remoteJid: string) {
    return `${agentId}:${remoteJid}`;
  }

  private async updateThreadHistory(key: string, role: 'user' | 'assistant', content: string, agentId?: number, userId?: string) {
    const history = this.threadHistory.get(key) || [];
    history.push({ role, content });
    if (history.length > 20) history.shift();
    this.threadHistory.set(key, history);

    if (this.env?.DATABASE_URL) {
      try {
        const db = getDb(this.env.DATABASE_URL);
        const [aId, remoteJid] = key.split(':');
        const numAgentId = parseInt(aId, 10);
        
        // Find existing conversation
        const existing = await db.execute(sql`
          SELECT id FROM whatsapp_conversations 
          WHERE agent_id = ${numAgentId} AND metadata->>'remoteJid' = ${remoteJid}
          LIMIT 1;
        `);

        if (existing.rows.length > 0 && existing.rows[0].id) {
          await db.execute(sql`
            UPDATE whatsapp_conversations 
            SET last_message = ${content}, 
                metadata = ${JSON.stringify({ history, remoteJid })}, 
                updated_at = NOW()
            WHERE id = ${existing.rows[0].id};
          `);
        } else {
          let finalUserId = userId;
          if (!finalUserId) {
            const agent = await db.query.agentConfigurations.findFirst({
              where: eq(agentConfigurations.id, numAgentId)
            });
            finalUserId = agent?.userId || 'unknown';
          }
          await db.execute(sql`
            INSERT INTO whatsapp_conversations (user_id, agent_id, last_message, metadata, updated_at)
            VALUES (${finalUserId}, ${numAgentId}, ${content}, ${JSON.stringify({ history, remoteJid })}, NOW());
          `);
        }
      } catch (e) {
        console.error(`[WA Agent ${agentId || key}] Failed to sync thread history to DB:`, e);
      }
    }
  }

  /**
   * Force-reconnect: kills any existing session, wipes stale DB creds, 
   * and starts completely fresh so a new QR code is generated.
   */
  async reconnectAgent(agentId: number) {
    // Kill existing session
    const existingSock = this.sessions.get(agentId);
    if (existingSock) {
      try { existingSock.end(undefined); } catch {}
      try { existingSock.ws?.close(); } catch {}
    }
    this.sessions.delete(agentId);
    this.qrs.delete(agentId);
    this.statuses.set(agentId, 'disconnected');
    this.initLocks.delete(agentId);

    // CRITICAL: Wipe stale DB credentials so Baileys generates fresh ones + new QR
    if (this.env?.DATABASE_URL) {
      console.log(`[WA Agent ${agentId}] Clearing stale auth credentials from DB...`);
      await clearAuthState(this.env.DATABASE_URL, agentId);
    }

    // Start fresh — will create new creds and generate QR
    await this.initializeAgent(agentId);
  }

  async initializeAgent(agentId: number) {
    // Prevent duplicate concurrent initializations
    if (this.initLocks.has(agentId)) {
      console.log(`[WA Agent ${agentId}] Init already in progress, skipping`);
      return;
    }

    // If already connected, skip
    if (this.sessions.has(agentId) && this.statuses.get(agentId) === 'connected') {
      console.log(`[WA Agent ${agentId}] Already connected, skipping init`);
      return;
    }

    if (!this.env) throw new Error("WhatsAppManager: Environment not set.");

    this.initLocks.add(agentId);
    this.statuses.set(agentId, 'connecting');
    console.log(`[WA Agent ${agentId}] Starting initialization...`);

    try {
      const { state, saveCreds } = await useDatabaseAuthState(this.env.DATABASE_URL, agentId);
      console.log(`[WA Agent ${agentId}] Auth state loaded from DB`);
      
      const { version } = await fetchLatestBaileysVersion();
      console.log(`[WA Agent ${agentId}] Baileys version: ${version.join('.')}`);
      
      const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        logger: pino({ level: 'warn' }),
        browser: ["Launch-Pixel", "Chrome", "1.1.0"],
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
      });

      this.sessions.set(agentId, sock);

      sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.qrs.set(agentId, qr);
          console.log(`[WA Agent ${agentId}] ✅ QR Code generated`);
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const isLoggedOut = statusCode === DisconnectReason.loggedOut;
          
          console.log(`[WA Agent ${agentId}] Connection closed (code: ${statusCode}). LoggedOut: ${isLoggedOut}`);
          this.statuses.set(agentId, 'disconnected');
          this.qrs.delete(agentId);
          this.sessions.delete(agentId);
          this.initLocks.delete(agentId);
          
          if (isLoggedOut) {
            // 401 = stale creds. Wipe them so next connect generates fresh QR.
            console.log(`[WA Agent ${agentId}] Stale credentials detected (401). Clearing DB auth...`);
            if (this.env?.DATABASE_URL) {
              await clearAuthState(this.env.DATABASE_URL, agentId);
            }
            // Don't auto-reconnect — user must click Connect Device again
            console.log(`[WA Agent ${agentId}] Ready for fresh connection. Click Connect Device.`);
          } else {
            // Non-401 disconnect — auto-reconnect
            console.log(`[WA Agent ${agentId}] Scheduling reconnection in 5s...`);
            setTimeout(() => this.initializeAgent(agentId), 5000);
          }
        } else if (connection === 'open') {
          console.log(`[WA Agent ${agentId}] ✅ WhatsApp Connected & Online!`);
          this.statuses.set(agentId, 'connected');
          this.qrs.delete(agentId);
          this.initLocks.delete(agentId);
        }
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('messages.upsert', async (m: any) => {
        if (m.type === 'notify') {
          for (const msg of m.messages) {
            if (!msg.key.fromMe && !msg.key.remoteJid?.includes('@g.us')) {
              await this.handleInboundMessage(agentId, msg);
            }
          }
        }
      });

      console.log(`[WA Agent ${agentId}] Socket created, waiting for connection events...`);
      
    } catch (error: any) {
      console.error(`[WA Agent ${agentId}] ❌ Init failed:`, error.message);
      this.statuses.set(agentId, 'disconnected');
      this.sessions.delete(agentId);
      this.initLocks.delete(agentId);
      throw error;
    }
  }

  private async handleInboundMessage(agentId: number, msg: WAMessage) {
    if (!this.env) return;
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid) return;

    let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    
    if (!text && (msg.message?.audioMessage || msg.message?.videoMessage)) {
      console.log(`[WA Agent ${agentId}] Audio/Video message detected. Transcribing...`);
      try {
        const buffer = await downloadMediaMessage(msg, 'buffer', {});
        text = await transcribeAudio(buffer as Buffer, this.env);
        console.log(`[WA Agent ${agentId}] Transcription: "${text}"`);
      } catch (e) {
        console.error(`[WA Agent ${agentId}] Transcription failed:`, e);
      }
    }

    if (!text) return;

    const db = getDb(this.env.DATABASE_URL);
    const agent = await db.query.agentConfigurations.findFirst({
      where: eq(agentConfigurations.id, agentId)
    });

    if (!agent || !agent.whatsappEnabled) return;

    const threadKey = this.getThreadKey(agentId, remoteJid);
    
    // Fallback: If memory is empty (e.g. server restarted), try loading from DB
    if (!this.threadHistory.has(threadKey)) {
      console.log(`[WA Agent ${agentId}] 🧠 Memory empty for ${remoteJid}, attempting to restore from database...`);
      try {
        const existing = await db.execute(sql`
          SELECT metadata FROM whatsapp_conversations 
          WHERE agent_id = ${agentId} AND metadata->>'remoteJid' = ${remoteJid}
          LIMIT 1;
        `);
        const metadata = existing.rows[0]?.metadata as { history?: any[] } | undefined;
        if (metadata && metadata.history && Array.isArray(metadata.history)) {
          this.threadHistory.set(threadKey, metadata.history);
          console.log(`[WA Agent ${agentId}] 🧠 Successfully restored ${metadata.history.length} past messages from DB for ${remoteJid}`);
        } else {
          console.log(`[WA Agent ${agentId}] 🧠 No existing database history found for ${remoteJid}. Starting fresh.`);
        }
      } catch (e: any) {
        console.error(`[WA Agent ${agentId}] ❌ Failed to load history from DB:`, e.message);
      }
    }

    console.log(`[WA Agent ${agentId}] 📥 Inbound from ${remoteJid}: "${text}"`);
    await this.updateThreadHistory(threadKey, 'user', text, agentId, agent.userId);

    const sock = this.sessions.get(agentId);
    await sock.sendPresenceUpdate('composing', remoteJid);

    try {
      const history = this.threadHistory.get(threadKey) || [];
      
      const result = await runSketchAgent({
        userId: agent.userId,
        systemPrompt: agent.systemPrompt,
        userMessage: text,
        history: history.slice(0, -1),
        env: this.env,
        steeringInstructions: agent.steeringInstructions || undefined,
        canvasState: agent.canvasState,
        adminWhatsAppNumber: agent.adminWhatsAppNumber || undefined,
        agentId: agent.id
      });

      await this.updateThreadHistory(threadKey, 'assistant', result.text, agentId, agent.userId);
      await sock.sendMessage(remoteJid, { text: result.text });
      
      console.log(`[WA Agent ${agentId}] 📤 Successfully replied to ${remoteJid}`);
    } catch (err) {
      console.error(`[WA Agent ${agentId}] ❌ Reply failed:`, err);
    } finally {
      await sock.sendPresenceUpdate('paused', remoteJid);
    }
  }

  getQR(agentId: number) {
    return this.qrs.get(agentId) || null;
  }

  getStatus(agentId: number) {
    return this.statuses.get(agentId) || 'disconnected';
  }

  async sendMessage(agentId: number, to: string, text: string) {
    const sock = this.sessions.get(agentId);
    if (!sock || this.statuses.get(agentId) !== 'connected') {
      throw new Error("WhatsApp agent not connected");
    }
    const jid = to.includes('@s.whatsapp.net') ? to : `${to.replace(/\D/g, '')}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
    this.updateThreadHistory(this.getThreadKey(agentId, jid), 'assistant', text);
  }

  async bootstrap() {
    if (!this.env) return;
    try {
      const db = getDb(this.env.DATABASE_URL);
      const activeAgents = await db.query.agentConfigurations.findMany({
        where: eq(agentConfigurations.whatsappEnabled, true)
      });

      console.log(`[WhatsApp] Bootstrapping ${activeAgents.length} agents...`);
      for (const agent of activeAgents) {
        this.initializeAgent(agent.id).catch(e => console.error(`Failed to init agent ${agent.id}:`, e.message));
      }
    } catch (e: any) {
      console.error('[WhatsApp] Bootstrap failed:', e.message);
    }
  }
}

export const waManager = new WhatsAppManager();
