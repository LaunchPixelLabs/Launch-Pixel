import { Bindings } from "../index";
import { getDb } from "../db";
import { agentContacts, callLogs, agentMemory } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getContactContext(dbUrl: string, contactPhone: string, agentId: number) {
  const db = getDb(dbUrl);
  
  // Find contact
  const contact = await db.query.agentContacts.findFirst({
    where: eq(agentContacts.phoneNumber, contactPhone)
  });

  if (!contact) {
    return `No prior contact history found for ${contactPhone}.`;
  }

  // Get last 3 call logs
  const logs = await db.query.callLogs.findMany({
    where: eq(callLogs.contactId, contact.id),
    orderBy: [desc(callLogs.createdAt)],
    limit: 3
  });

  // Get memories
  const memories = await db.query.agentMemory.findMany({
    where: eq(agentMemory.contactId, contact.id),
    orderBy: [desc(agentMemory.importance), desc(agentMemory.createdAt)]
  });

  const lastCallsStr = logs.length > 0 
    ? logs.map(l => `- [${l.createdAt?.toISOString().split('T')[0]}] Outcome: ${l.outcome}. Summary: ${l.summary || 'No summary'}`).join('\n')
    : "No previous calls.";

  const memoriesStr = memories.length > 0
    ? memories.map(m => `- [${m.memoryType.toUpperCase()}] ${m.content} (Importance: ${m.importance})`).join('\n')
    : "No memories recorded yet.";

  return `
<contact_briefing>
Name: ${contact.name || 'Unknown'}
Company: ${contact.company || 'Unknown'}
Email: ${contact.email || 'Unknown'}
Timezone: ${contact.timezone || 'Unknown'}
Deal Stage: ${contact.dealStage || 'Unknown'}
Lead Score: ${contact.leadScore || 0}/100

=== LAST 3 INTERACTIONS ===
${lastCallsStr}

=== KEY MEMORIES ===
${memoriesStr}
</contact_briefing>
  `.trim();
}

export async function extractAndSaveMemories(env: Bindings, callLogId: number, transcript: string) {
  if (!transcript || transcript.length < 50) return;

  const apiKey = env.ANTHROPIC_ADMIN_KEY || env.ANTHROPIC_API_KEY;
  if (!apiKey) return;

  const db = getDb(env.DATABASE_URL);
  
  const log = await db.query.callLogs.findFirst({
    where: eq(callLogs.id, callLogId)
  });

  if (!log || !log.contactId || !log.userId || !log.agentConfigId) return;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey });

    const prompt = `
Analyze the following phone call transcript between an AI sales agent and a potential customer.
Extract key memories about the contact that would be useful for future interactions.
Focus on:
1. Personal or business facts (name, role, company, tools they use, timezone).
2. Preferences ("prefers email", "busy on Mondays").
3. Objections raised ("too expensive", "not the decision maker").
4. Commitments made ("will review proposal by Friday").
5. Relationship signals ("was frustrated", "mentioned competitor").

Transcript:
"""
${transcript}
"""

Return ONLY a JSON array of objects, where each object has the keys:
- type: one of 'fact', 'preference', 'objection', 'commitment', 'relationship'
- content: a concise string summarizing the memory (e.g. "Uses Salesforce for CRM")
- importance: an integer from 1 to 10 (10 being most critical to closing the deal)

If there are no meaningful memories to extract, return an empty array [].
`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });

    const content = (response.content[0] as any).text;
    const startIndex = content.indexOf('[');
    const endIndex = content.lastIndexOf(']') + 1;
    
    if (startIndex === -1 || endIndex === 0) return;
    
    const memoriesData = JSON.parse(content.substring(startIndex, endIndex));

    for (const mem of memoriesData) {
      await saveMemory(env.DATABASE_URL, {
        agentId: log.agentConfigId,
        contactId: log.contactId,
        userId: log.userId,
        type: mem.type,
        content: mem.content,
        source: 'call',
        sourceId: log.callSid,
        importance: mem.importance
      });
    }

  } catch (error) {
    console.error("[Memory] Error extracting memories:", error);
  }
}

export async function saveMemory(dbUrl: string, memory: {
  agentId: number;
  contactId: number;
  userId: string;
  type: string;
  content: string;
  source: string;
  sourceId?: string;
  importance?: number;
}) {
  const db = getDb(dbUrl);
  await db.insert(agentMemory).values({
    agentId: memory.agentId,
    contactId: memory.contactId,
    userId: memory.userId,
    memoryType: memory.type,
    content: memory.content,
    source: memory.source,
    sourceId: memory.sourceId,
    importance: memory.importance || 5,
  });
}
