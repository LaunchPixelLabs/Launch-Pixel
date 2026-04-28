import { getDb } from "../db";
import { whatsappAuth, whatsappSessions, agentConfigurations } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthenticationCreds, AuthenticationState, SignalDataTypeMap, proto } from "@whiskeysockets/baileys";

// ─────────────────────────────────────────────────────────
// MODULE-LEVEL SINGLETON CACHES
// Survive reconnections (515 stream errors). One cache per agent.
// ─────────────────────────────────────────────────────────
const agentKeyCache = new Map<number, Map<string, string>>();
const agentCredsCache = new Map<number, string>();
const agentDirtyKeys = new Map<number, Set<string>>();
const agentDeletedKeys = new Map<number, Set<string>>();
const flushTimers = new Map<number, ReturnType<typeof setTimeout>>();
const cacheLoaded = new Set<number>(); // Track which agents have been loaded from DB

// ─── Serialization helpers ───
const serialize = (data: any): string =>
  JSON.stringify(data, (_key, value) =>
    Buffer.isBuffer(value) ? { type: 'Buffer', data: value.toString('base64') } : value
  );

const deserialize = (json: string): any =>
  JSON.parse(json, (_key, value) =>
    value?.type === 'Buffer' ? Buffer.from(value.data, 'base64') : value
  );

/**
 * Wipe all stored Baileys auth credentials + session keys for an agent.
 * Clears BOTH in-memory cache and database.
 */
export async function clearAuthState(databaseUrl: string, agentId: number): Promise<void> {
  // Clear in-memory caches
  agentKeyCache.delete(agentId);
  agentCredsCache.delete(agentId);
  agentDirtyKeys.delete(agentId);
  agentDeletedKeys.delete(agentId);
  cacheLoaded.delete(agentId);
  const timer = flushTimers.get(agentId);
  if (timer) clearTimeout(timer);
  flushTimers.delete(agentId);

  // Clear database
  const db = getDb(databaseUrl);
  try {
    await db.delete(whatsappAuth).where(eq(whatsappAuth.agentId, agentId));
    await db.delete(whatsappSessions).where(eq(whatsappSessions.agentId, agentId));
    console.log(`[WA Auth] Cleared all credentials for agent ${agentId} (memory + DB)`);
  } catch (e: any) {
    console.error(`[WA Auth] Failed to clear DB credentials for agent ${agentId}:`, e.message);
  }
}

/**
 * Flush dirty keys to database (background, non-blocking).
 * Sequential writes to avoid overwhelming Neon serverless HTTP.
 */
async function flushToDB(databaseUrl: string, agentId: number) {
  const dirtyKeys = agentDirtyKeys.get(agentId);
  const deletedKeys = agentDeletedKeys.get(agentId);
  const cache = agentKeyCache.get(agentId);
  if (!dirtyKeys && !deletedKeys) return;
  if (!cache) return;

  const keysToWrite = dirtyKeys ? [...dirtyKeys] : [];
  const keysToDelete = deletedKeys ? [...deletedKeys] : [];
  dirtyKeys?.clear();
  deletedKeys?.clear();

  if (keysToWrite.length === 0 && keysToDelete.length === 0) return;

  const db = getDb(databaseUrl);
  let writeOk = 0, writeFail = 0;

  for (const sessionId of keysToWrite) {
    const json = cache.get(sessionId);
    if (!json) continue;
    try {
      // Delete + insert (safe upsert for Neon)
      await db.delete(whatsappSessions).where(
        and(eq(whatsappSessions.agentId, agentId), eq(whatsappSessions.sessionId, sessionId))
      );
      await db.insert(whatsappSessions).values({
        agentId, sessionId, data: json, updatedAt: new Date()
      });
      writeOk++;
    } catch (e: any) {
      writeFail++;
      // Re-mark as dirty for next flush
      if (!agentDirtyKeys.has(agentId)) agentDirtyKeys.set(agentId, new Set());
      agentDirtyKeys.get(agentId)!.add(sessionId);
    }
  }

  for (const sessionId of keysToDelete) {
    try {
      await db.delete(whatsappSessions).where(
        and(eq(whatsappSessions.agentId, agentId), eq(whatsappSessions.sessionId, sessionId))
      );
    } catch {}
  }

  console.log(`[WA Auth] DB flush agent ${agentId}: ${writeOk} ok, ${writeFail} failed, ${keysToDelete.length} deleted`);
}

function scheduleFlush(databaseUrl: string, agentId: number) {
  const existing = flushTimers.get(agentId);
  if (existing) clearTimeout(existing);
  flushTimers.set(agentId, setTimeout(() => {
    flushToDB(databaseUrl, agentId).catch(e =>
      console.error(`[WA Auth] Background flush failed:`, e.message)
    );
  }, 3000)); // 3s debounce — gives Baileys time to batch writes
}

/**
 * Database-backed auth state for Baileys with SINGLETON in-memory cache.
 *
 * Cache is MODULE-LEVEL, keyed by agentId. Survives 515 reconnects.
 * Baileys reads/writes to RAM instantly. DB syncs every 3s in background.
 * saveCreds is fully wrapped in try-catch — never crashes the process.
 */
export async function useDatabaseAuthState(
  databaseUrl: string,
  agentId: number
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const db = getDb(databaseUrl);

  // ─── Get or create singleton cache ───
  if (!agentKeyCache.has(agentId)) {
    agentKeyCache.set(agentId, new Map());
  }
  const cache = agentKeyCache.get(agentId)!;

  if (!agentDirtyKeys.has(agentId)) agentDirtyKeys.set(agentId, new Set());
  if (!agentDeletedKeys.has(agentId)) agentDeletedKeys.set(agentId, new Set());

  // ─── Load from DB ONLY on first init (cold start) ───
  if (!cacheLoaded.has(agentId)) {
    try {
      const existingSessions = await db.query.whatsappSessions.findMany({
        where: eq(whatsappSessions.agentId, agentId)
      });
      for (const row of existingSessions) {
        cache.set(row.sessionId, row.data);
      }
      cacheLoaded.add(agentId);
      if (existingSessions.length > 0) {
        console.log(`[WA Auth] Loaded ${existingSessions.length} session keys from DB for agent ${agentId}`);
      }
    } catch (e: any) {
      console.error(`[WA Auth] Failed to preload sessions:`, e.message);
      cacheLoaded.add(agentId); // Don't retry forever
    }
  } else {
    console.log(`[WA Auth] Using ${cache.size} cached session keys for agent ${agentId} (reconnect)`);
  }

  // ─── Load or create creds ───
  let creds: AuthenticationCreds;
  const cachedCreds = agentCredsCache.get(agentId);
  if (cachedCreds) {
    creds = deserialize(cachedCreds);
    console.log(`[WA Auth] Using cached creds for agent ${agentId} (reconnect)`);
  } else {
    const authRow = await db.query.whatsappAuth.findFirst({
      where: eq(whatsappAuth.agentId, agentId)
    });
    if (authRow) {
      creds = deserialize(authRow.creds);
      agentCredsCache.set(agentId, authRow.creds);
    } else {
      const { initAuthCreds } = await import("@whiskeysockets/baileys");
      creds = initAuthCreds();
    }
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [id: string]: any } = {};
          for (const id of ids) {
            const sId = `${type}-${id}`;
            const json = cache.get(sId);
            if (json) {
              let value = deserialize(json);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            } else {
              data[id] = null;
            }
          }
          return data;
        },
        set: async (data) => {
          const dirtyKeys = agentDirtyKeys.get(agentId)!;
          const deletedKeys = agentDeletedKeys.get(agentId)!;

          for (const category in data) {
            const catData = (data as any)[category];
            if (!catData) continue;
            for (const id in catData) {
              const value = catData[id];
              const sId = `${category}-${id}`;
              if (value) {
                cache.set(sId, serialize(value));
                deletedKeys.delete(sId);
                dirtyKeys.add(sId);
              } else {
                cache.delete(sId);
                dirtyKeys.delete(sId);
                deletedKeys.add(sId);
              }
            }
          }
          // Schedule background DB flush — never blocks Baileys
          scheduleFlush(databaseUrl, agentId);
        }
      }
    },
    saveCreds: async () => {
      // Cache creds in memory immediately
      const json = serialize(creds);
      agentCredsCache.set(agentId, json);

      // Persist to DB in background — NEVER throw
      try {
        const existing = await db.query.whatsappAuth.findFirst({
          where: eq(whatsappAuth.agentId, agentId)
        });

        if (existing) {
          await db.update(whatsappAuth)
            .set({ creds: json, updatedAt: new Date() })
            .where(eq(whatsappAuth.id, existing.id));
        } else {
          const agent = await db.query.agentConfigurations.findFirst({
            where: eq(agentConfigurations.id, agentId)
          });
          await db.insert(whatsappAuth).values({
            agentId,
            userId: agent?.userId || 'unknown',
            creds: json,
            updatedAt: new Date()
          });
        }
      } catch (e: any) {
        // NEVER crash the process — creds are safe in memory
        console.error(`[WA Auth] saveCreds DB write failed (creds safe in memory):`, e.message);
      }
    }
  };
}
