import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';

/**
 * Sketch-style WhatsApp Adapter
 * 
 * Uses Baileys for cost-effective, QR-paired WhatsApp integration.
 */

export class WhatsAppAdapter {
  private socket: any = null;
  private qr: string | null = null;
  private status: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    console.log(`[WhatsApp] Using Baileys v${version.join('.')}${isLatest ? '' : ' (outdated)'}`);

    this.socket = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      logger: pino({ level: 'silent' }),
    });

    this.socket.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        this.qr = qr;
        console.log('[WhatsApp] New QR code generated.');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('[WhatsApp] Connection closed. Reconnecting:', shouldReconnect);
        this.status = 'disconnected';
        if (shouldReconnect) this.connect();
      } else if (connection === 'open') {
        console.log('[WhatsApp] Connection opened successfully.');
        this.status = 'connected';
        this.qr = null;
      }
    });

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on('messages.upsert', async (m: any) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message?.conversation) {
            console.log(`[WhatsApp] Received message from ${msg.key.remoteJid}: ${msg.message.conversation}`);
            // TODO: Route to agent reasoning engine
          }
        }
      }
    });
  }

  getQR() {
    return this.qr;
  }

  getStatus() {
    return this.status;
  }

  async sendMessage(to: string, text: string) {
    if (this.status !== 'connected') {
      throw new Error('WhatsApp not connected');
    }
    await this.socket.sendMessage(to, { text });
  }
}

// Singleton instance for the server
export const waAdapter = new WhatsAppAdapter();
