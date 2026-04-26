import { getDb } from "../db";
import { whatsappAuth, whatsappSessions, agentConfigurations } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthenticationCreds, AuthenticationState, SignalDataTypeMap, proto } from "@whiskeysockets/baileys";

/**
 * Custom database-backed auth state for Baileys.
 * Ported from CanvasX Sketch architecture.
 */
export async function useDatabaseAuthState(databaseUrl: string, agentId: number): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> {
  const db = getDb(databaseUrl);

  const writeData = async (data: any, sessionId: string) => {
    const json = JSON.stringify(data, (key, value) => {
      if (Buffer.isBuffer(value)) return { type: 'Buffer', data: value.toString('base64') };
      return value;
    });

    // Check if exists
    const existing = await db.query.whatsappSessions.findFirst({
      where: and(
        eq(whatsappSessions.agentId, agentId),
        eq(whatsappSessions.sessionId, sessionId)
      )
    });

    if (existing) {
      await db.update(whatsappSessions)
        .set({ data: json, updatedAt: new Date() })
        .where(eq(whatsappSessions.id, existing.id));
    } else {
      await db.insert(whatsappSessions).values({
        agentId,
        sessionId,
        data: json,
        updatedAt: new Date()
      });
    }
  };

  const readData = async (sessionId: string) => {
    const row = await db.query.whatsappSessions.findFirst({
      where: and(
        eq(whatsappSessions.agentId, agentId),
        eq(whatsappSessions.sessionId, sessionId)
      )
    });

    if (!row) return null;

    return JSON.parse(row.data, (key, value) => {
      if (value?.type === 'Buffer') return Buffer.from(value.data, 'base64');
      return value;
    });
  };

  const removeData = async (sessionId: string) => {
    await db.delete(whatsappSessions)
      .where(and(
        eq(whatsappSessions.agentId, agentId),
        eq(whatsappSessions.sessionId, sessionId)
      ));
  };

  // 1. Initial creds load
  const authRow = await db.query.whatsappAuth.findFirst({
    where: eq(whatsappAuth.agentId, agentId)
  });

  let creds: AuthenticationCreds;
  if (authRow) {
    creds = JSON.parse(authRow.creds, (key, value) => {
      if (value?.type === 'Buffer') return Buffer.from(value.data, 'base64');
      return value;
    });
  } else {
    // Import init function dynamically to save memory on Worker boot
    const { initAuthCreds } = await import("@whiskeysockets/baileys");
    creds = initAuthCreds();
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [id: string]: any } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            const cat = category as keyof SignalDataTypeMap;
            const catData = data[cat];
            if (!catData) continue;
            for (const id in catData) {
              const value = (catData as any)[id];
              const sId = `${category}-${id}`;
              if (value) {
                tasks.push(writeData(value, sId));
              } else {
                tasks.push(removeData(sId));
              }
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: async () => {
      const json = JSON.stringify(creds, (key, value) => {
        if (Buffer.isBuffer(value)) return { type: 'Buffer', data: value.toString('base64') };
        return value;
      });

      const existing = await db.query.whatsappAuth.findFirst({
        where: eq(whatsappAuth.agentId, agentId)
      });

      if (existing) {
        await db.update(whatsappAuth)
          .set({ creds: json, updatedAt: new Date() })
          .where(eq(whatsappAuth.id, existing.id));
      } else {
        // Need to find userId for this agent
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
    }
  };
}
