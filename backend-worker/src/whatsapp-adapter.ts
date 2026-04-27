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
 * Production-grade WhatsApp Manager (Baileys v4)
 * Supports multiple concurrent agent sessions with DB-backed persistence.
 */
/**
 * Production-grade WhatsApp Manager (Baileys v4)
 * Hardened for commercial scale with Neural Memory buffers and robust routing.
 */
export class WhatsAppManager {
  private sessions = new Map<number, any>();
  private qrs = new Map<number, string>();
  private statuses = new Map<number, 'disconnected' | 'connecting' | 'connected'>();
  private env: Bindings | null = null;
  
  // Synaptic Thread Buffer (Memory)
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

  async initializeAgent(agentId: number) {
    if (this.sessions.has(agentId)) return;
    if (!this.env) throw new Error("WhatsAppManager: Environment not set");

    this.statuses.set(agentId, 'connecting');
    const { state, saveCreds } = await useDatabaseAuthState(this.env.DATABASE_URL, agentId);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      logger: pino({ level: 'silent' }),
      browser: ["Launch-Pixel Matrix", "Chrome", "1.1.0"],
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
    });

    this.sessions.set(agentId, sock);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        this.qrs.set(agentId, qr);
        console.log(`[WA Agent ${agentId}] New Synaptic QR generated`);
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`[WA Agent ${agentId}] Connection severed (${statusCode}). Attempting reconnection:`, shouldReconnect);
        this.statuses.set(agentId, 'disconnected');
        this.qrs.delete(agentId);
        
        if (shouldReconnect) {
          setTimeout(() => this.initializeAgent(agentId), 5000);
        } else {
          this.sessions.delete(agentId);
          console.warn(`[WA Agent ${agentId}] Session permanently closed (Logged Out)`);
        }
      } else if (connection === 'open') {
        console.log(`[WA Agent ${agentId}] Neural Matrix Connected & Online`);
        this.statuses.set(agentId, 'connected');
        this.qrs.delete(agentId);
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && !msg.key.remoteJid?.includes('@g.us')) {
            await this.handleInboundMessage(agentId, msg);
          }
        }
      }
    });
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
      
      // Autonomous Neural Run
      const result = await runSketchAgent({
        userId: agent.userId,
        systemPrompt: agent.systemPrompt,
        userMessage: text,
        history: history.slice(0, -1), // Everything except the current message
        env: this.env,
        steeringInstructions: agent.steeringInstructions || undefined,
        canvasState: agent.canvasState,
        adminWhatsAppNumber: agent.adminWhatsAppNumber || undefined,
        agentId: agent.id
      });

      // Commit response to memory and reply
      this.updateThreadHistory(threadKey, 'assistant', result.text);
      await sock.sendMessage(remoteJid, { text: result.text });
      
      console.log(`[WA Agent ${agentId}] Successfully replied to ${remoteJid}`);
    } catch (err) {
      console.error(`[WA Agent ${agentId}] Neural matrix fault:`, err);
      // Fallback: Notify of temporary disruption if critical
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
      throw new Error("WhatsApp agent not connected to neural matrix");
    }
    const jid = to.includes('@s.whatsapp.net') ? to : `${to.replace(/\D/g, '')}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
    
    // Track outbound as well
    this.updateThreadHistory(this.getThreadKey(agentId, jid), 'assistant', text);
  }

  async bootstrap() {
    if (!this.env) return;
    const db = getDb(this.env.DATABASE_URL);
    const activeAgents = await db.query.agentConfigurations.findMany({
      where: eq(agentConfigurations.whatsappEnabled, true)
    });

    console.log(`[WhatsApp] Bootstrapping ${activeAgents.length} neural links...`);
    for (const agent of activeAgents) {
      this.initializeAgent(agent.id).catch(e => console.error(`Failed to link agent ${agent.id}:`, e));
    }
  }
}

export const waManager = new WhatsAppManager();
