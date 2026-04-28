import { getDb } from "../db";
import { whatsappAuth, whatsappSessions, agentConfigurations } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthenticationCreds, AuthenticationState, SignalDataTypeMap, proto } from "@whiskeysockets/baileys";

/**
 * Wipe all stored Baileys auth credentials + session keys for an agent.
 */
export async function clearAuthState(databaseUrl: string, agentId: number): Promise<void> {
  const db = getDb(databaseUrl);
  try {
    await db.delete(whatsappAuth).where(eq(whatsappAuth.agentId, agentId));
    await db.delete(whatsappSessions).where(eq(whatsappSessions.agentId, agentId));
    console.log(`[WA Auth] Cleared all credentials for agent ${agentId}`);
  } catch (e: any) {
    console.error(`[WA Auth] Failed to clear credentials for agent ${agentId}:`, e.message);
  }
}

/**
 * Database-backed auth state for Baileys with IN-MEMORY CACHE.
 * 
 * Problem: Baileys handshake writes ~50 signal keys in a tight window.
 * Neon serverless HTTP is too slow (2 HTTP requests per key = 100 requests).
 * Baileys times out with "Pre-key upload timeout (408)".
 * 
 * Solution: Read/write to an in-memory Map instantly. Flush to DB 
 * asynchronously in background. Baileys never waits for DB.
 */
export async function useDatabaseAuthState(databaseUrl: string, agentId: number): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> {
  const db = getDb(databaseUrl);

  // In-memory cache: sessionId -> JSON string
  const cache = new Map<string, string>();
  const dirtyKeys = new Set<string>(); // Keys that need DB sync
  const deletedKeys = new Set<string>(); // Keys to delete from DB
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Helper: serialize data with Buffer support ---
  const serialize = (data: any): string => {
    return JSON.stringify(data, (key, value) => {
      if (Buffer.isBuffer(value)) return { type: 'Buffer', data: value.toString('base64') };
      return value;
    });
  };

  const deserialize = (json: string): any => {
    return JSON.parse(json, (key, value) => {
      if (value?.type === 'Buffer') return Buffer.from(value.data, 'base64');
      return value;
    });
  };

  // --- Background DB flush (debounced) ---
  const flushToDb = async () => {
    if (dirtyKeys.size === 0 && deletedKeys.size === 0) return;

    const keysToWrite = [...dirtyKeys];
    const keysToDelete = [...deletedKeys];
    dirtyKeys.clear();
    deletedKeys.clear();

    try {
      // Batch writes — sequential to avoid overwhelming Neon
      for (const sessionId of keysToWrite) {
        const json = cache.get(sessionId);
        if (!json) continue;
        try {
          // Try insert first, update on conflict would be ideal but Drizzle 
          // doesn't support onConflictDoUpdate for composite keys easily.
          // So: delete + insert (2 ops but reliable)
          await db.delete(whatsappSessions).where(
            and(eq(whatsappSessions.agentId, agentId), eq(whatsappSessions.sessionId, sessionId))
          );
          await db.insert(whatsappSessions).values({
            agentId,
            sessionId,
            data: json,
            updatedAt: new Date()
          });
        } catch (e: any) {
          console.error(`[WA Auth] DB write failed for ${sessionId}:`, e.message);
          // Re-mark as dirty for next flush
          dirtyKeys.add(sessionId);
        }
      }

      // Batch deletes
      for (const sessionId of keysToDelete) {
        try {
          await db.delete(whatsappSessions).where(
            and(eq(whatsappSessions.agentId, agentId), eq(whatsappSessions.sessionId, sessionId))
          );
        } catch (e: any) {
          console.error(`[WA Auth] DB delete failed for ${sessionId}:`, e.message);
        }
      }

      if (keysToWrite.length > 0 || keysToDelete.length > 0) {
        console.log(`[WA Auth] DB flush: ${keysToWrite.length} writes, ${keysToDelete.length} deletes`);
      }
    } catch (e: any) {
      console.error(`[WA Auth] DB flush failed:`, e.message);
    }
  };

  const scheduleFlush = () => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushToDb, 2000); // Flush every 2s max
  };

  // --- Pre-load existing session data into cache ---
  try {
    const existingSessions = await db.query.whatsappSessions.findMany({
      where: eq(whatsappSessions.agentId, agentId)
    });
    for (const row of existingSessions) {
      cache.set(row.sessionId, row.data);
    }
    if (existingSessions.length > 0) {
      console.log(`[WA Auth] Loaded ${existingSessions.length} cached session keys`);
    }
  } catch (e: any) {
    console.error(`[WA Auth] Failed to preload sessions:`, e.message);
  }

  // --- Cache-first read/write ---
  const writeData = (data: any, sessionId: string) => {
    const json = serialize(data);
    cache.set(sessionId, json);
    deletedKeys.delete(sessionId);
    dirtyKeys.add(sessionId);
    scheduleFlush();
  };

  const readData = (sessionId: string): any | null => {
    const json = cache.get(sessionId);
    if (!json) return null;
    return deserialize(json);
  };

  const removeData = (sessionId: string) => {
    cache.delete(sessionId);
    dirtyKeys.delete(sessionId);
    deletedKeys.add(sessionId);
    scheduleFlush();
  };

  // --- Load initial creds ---
  const authRow = await db.query.whatsappAuth.findFirst({
    where: eq(whatsappAuth.agentId, agentId)
  });

  let creds: AuthenticationCreds;
  if (authRow) {
    creds = deserialize(authRow.creds);
  } else {
    const { initAuthCreds } = await import("@whiskeysockets/baileys");
    creds = initAuthCreds();
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [id: string]: any } = {};
          for (const id of ids) {
            let value = readData(`${type}-${id}`);
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          }
          return data;
        },
        set: async (data) => {
          for (const category in data) {
            const catData = (data as any)[category];
            if (!catData) continue;
            for (const id in catData) {
              const value = catData[id];
              const sId = `${category}-${id}`;
              if (value) {
                writeData(value, sId);
              } else {
                removeData(sId);
              }
            }
          }
          // Don't await DB — writes go to cache instantly
        }
      }
    },
    saveCreds: async () => {
      const json = serialize(creds);

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
        console.error(`[WA Auth] saveCreds failed:`, e.message);
      }
    }
  };
}
