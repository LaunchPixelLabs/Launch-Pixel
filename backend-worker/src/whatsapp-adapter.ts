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
import { useDatabaseAuthState } from './agent/whatsapp-auth';
import { runSketchAgent } from './agent/sketch-runner';
import { getDb } from './db';
import { agentConfigurations } from './db/schema';
import { eq } from 'drizzle-orm';
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
  private initLocks = new Set<number>(); // Prevent concurrent init for same agent
  
  // Thread History Buffer (In-memory conversation context)
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
    // Keep last 10 turns for context/cache efficiency
    if (history.length > 20) history.shift();
    this.threadHistory.set(key, history);
  }

  /**
   * Force-reconnect: kills any existing session and starts fresh.
   * Called by the /connect endpoint so repeated clicks always work.
   */
  async reconnectAgent(agentId: number) {
    // Kill existing session if any
    const existingSock = this.sessions.get(agentId);
    if (existingSock) {
      try { existingSock.end(undefined); } catch {}
      try { existingSock.ws?.close(); } catch {}
    }
    this.sessions.delete(agentId);
    this.qrs.delete(agentId);
    this.statuses.set(agentId, 'disconnected');
    this.initLocks.delete(agentId);

    // Start fresh
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

    if (!this.env) throw new Error("WhatsAppManager: Environment not set. Set DATABASE_URL.");

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
        printQRInTerminal: true, // Also print to server console for debugging
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        logger: pino({ level: 'warn' }), // Show warnings for debugging
        browser: ["Launch-Pixel", "Chrome", "1.1.0"],
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
      });

      this.sessions.set(agentId, sock);

      sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.qrs.set(agentId, qr);
          console.log(`[WA Agent ${agentId}] ✅ QR Code generated (${qr.substring(0, 30)}...)`);
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
            console.log(`[WA Agent ${agentId}] Scheduling reconnection in 5s...`);
            setTimeout(() => this.initializeAgent(agentId), 5000);
          } else {
            console.warn(`[WA Agent ${agentId}] Session permanently closed (Logged Out)`);
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
      throw error; // Re-throw so the route handler can send the error to the client
    }
  }

  private async handleInboundMessage(agentId: number, msg: WAMessage) {
    if (!this.env) return;
    const remoteJid = msg.key.remoteJid;
    if (!remoteJid) return;

    let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    
    // Check for Audio Message
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
      
      console.log(`[WA Agent ${agentId}] Successfully replied to ${remoteJid}`);
    } catch (err) {
      console.error(`[WA Agent ${agentId}] Reply failed:`, err);
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
