import makeWASocket, { 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WAMessage,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { useDatabaseAuthState } from './agent/whatsapp-auth';
import { runSketchAgent } from './agent/sketch-runner';
import { getDb } from './db';
import { agentConfigurations } from './db/schema';
import { eq } from 'drizzle-orm';
import { Bindings } from './index';

/**
 * Production-grade WhatsApp Manager (Baileys v4)
 * Supports multiple concurrent agent sessions with DB-backed persistence.
 */
export class WhatsAppManager {
  private sessions = new Map<number, any>();
  private qrs = new Map<number, string>();
  private statuses = new Map<number, 'disconnected' | 'connecting' | 'connected'>();
  private env: Bindings | null = null;
  private initLocks = new Set<number>(); // Prevent concurrent inits
  
  // Thread history for conversation context
  private threadHistory = new Map<string, Array<{ role: 'user' | 'assistant', content: string }>>();

  setEnv(env: Bindings) {
    this.env = env;
  }

  private getThreadKey(agentId: number, remoteJid: string) {
    return `${agentId}:${remoteJid}`;
  }

  private updateThreadHistory(key: string, role: 'user' | 'assistant', content: string) {
    const history = this.threadHistory.get(key) || [];
    history.push({ role, content });
    if (history.length > 20) history.shift();
    this.threadHistory.set(key, history);
  }

  /**
   * Force disconnect and clean up a session so it can be re-initialized fresh.
   */
  async disconnectAgent(agentId: number) {
    const sock = this.sessions.get(agentId);
    if (sock) {
      try { sock.end(undefined); } catch (_) {}
      try { sock.ws?.close(); } catch (_) {}
    }
    this.sessions.delete(agentId);
    this.qrs.delete(agentId);
    this.statuses.set(agentId, 'disconnected');
    this.initLocks.delete(agentId);
    console.log(`[WA Agent ${agentId}] Force disconnected and cleaned up`);
  }

  async initializeAgent(agentId: number) {
    // If already connected, nothing to do
    if (this.sessions.has(agentId) && this.statuses.get(agentId) === 'connected') {
      return;
    }

    // If a previous session exists but is NOT connected, clean it up first
    if (this.sessions.has(agentId)) {
      console.log(`[WA Agent ${agentId}] Stale session found (status: ${this.statuses.get(agentId)}), cleaning up...`);
      await this.disconnectAgent(agentId);
    }

    // Prevent concurrent initializations
    if (this.initLocks.has(agentId)) {
      console.log(`[WA Agent ${agentId}] Init already in progress, skipping`);
      return;
    }
    this.initLocks.add(agentId);

    if (!this.env) {
      this.initLocks.delete(agentId);
      throw new Error("WhatsAppManager: Environment not set");
    }

    this.statuses.set(agentId, 'connecting');
    
    try {
      console.log(`[WA Agent ${agentId}] Starting Baileys initialization...`);
      console.log(`[WA Agent ${agentId}] DATABASE_URL present: ${!!this.env.DATABASE_URL}`);
      
      const { state, saveCreds } = await useDatabaseAuthState(this.env.DATABASE_URL, agentId);
      console.log(`[WA Agent ${agentId}] Auth state loaded from DB`);
      
      const { version } = await fetchLatestBaileysVersion();
      console.log(`[WA Agent ${agentId}] Baileys version: ${version}`);
      
      const sock = makeWASocket({
        version,
        printQRInTerminal: true, // Also print to server logs for debugging
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        logger: pino({ level: 'warn' }), // Show warnings so we can debug
        browser: ["Launch-Pixel", "Chrome", "1.1.0"],
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
      });

      this.sessions.set(agentId, sock);
      console.log(`[WA Agent ${agentId}] Socket created, waiting for events...`);

      sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.qrs.set(agentId, qr);
          console.log(`[WA Agent ${agentId}] QR code generated (length: ${qr.length})`);
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log(`[WA Agent ${agentId}] Connection closed (code: ${statusCode}). Reconnect: ${shouldReconnect}`);
          this.statuses.set(agentId, 'disconnected');
          this.qrs.delete(agentId);
          this.sessions.delete(agentId);
          this.initLocks.delete(agentId);
          
          if (shouldReconnect) {
            setTimeout(() => {
              console.log(`[WA Agent ${agentId}] Attempting reconnection...`);
              this.initializeAgent(agentId).catch(e => 
                console.error(`[WA Agent ${agentId}] Reconnect failed:`, e)
              );
            }, 5000);
          } else {
            console.warn(`[WA Agent ${agentId}] Session permanently closed (Logged Out)`);
          }
        } else if (connection === 'open') {
          console.log(`[WA Agent ${agentId}] ✅ CONNECTED successfully!`);
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

    } catch (err: any) {
      console.error(`[WA Agent ${agentId}] ❌ Init failed:`, err.message, err.stack);
      // Clean up completely on failure
      this.sessions.delete(agentId);
      this.qrs.delete(agentId);
      this.statuses.set(agentId, 'disconnected');
      this.initLocks.delete(agentId);
      throw err; // Re-throw so the route handler can return the error
    }
  }

  private async handleInboundMessage(agentId: number, msg: WAMessage) {
    if (!this.env) return;
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    if (!text) return;

    const db = getDb(this.env.DATABASE_URL);
    const agent = await db.query.agentConfigurations.findFirst({
      where: eq(agentConfigurations.id, agentId)
    });

    if (!agent || !agent.whatsappEnabled) return;

    const threadKey = this.getThreadKey(agentId, remoteJid);
    this.updateThreadHistory(threadKey, 'user', text);

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

      this.updateThreadHistory(threadKey, 'assistant', result.text);
      await sock.sendMessage(remoteJid, { text: result.text });
      
      console.log(`[WA Agent ${agentId}] Replied to ${remoteJid}`);
    } catch (err) {
      console.error(`[WA Agent ${agentId}] Message handling error:`, err);
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
    const db = getDb(this.env.DATABASE_URL);
    const activeAgents = await db.query.agentConfigurations.findMany({
      where: eq(agentConfigurations.whatsappEnabled, true)
    });

    console.log(`[WhatsApp] Bootstrapping ${activeAgents.length} agents...`);
    for (const agent of activeAgents) {
      this.initializeAgent(agent.id).catch(e => console.error(`Failed to init agent ${agent.id}:`, e));
    }
  }
}

export const waManager = new WhatsAppManager();
