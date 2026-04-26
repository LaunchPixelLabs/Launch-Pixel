import { Bindings } from "../index";
import { getDb } from "../db";
import { callLogs, agentContacts, scheduledTasks, agentConfigurations } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { extractAndSaveMemories } from "./memory";

export interface AnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  leadScore: number;
  outcome: 'interested' | 'not-interested' | 'follow-up' | 'meeting-booked';
  summary: string;
  meetingBooked: boolean;
  nextAction?: { type: 'whatsapp_message' | 'outbound_call'; delayHours: number; content: string } | null;
}

/**
 * Uses Claude to analyze a call transcript and score the lead.
 */
export async function analyzeCallAndScoreLead(
  env: Bindings,
  callLogId: number,
  transcript: string
): Promise<AnalysisResult | null> {
  if (!transcript || transcript.length < 50) return null;

  const apiKey = env.ANTHROPIC_ADMIN_KEY || env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    // 1. Extract and Save Memories asynchronously
    extractAndSaveMemories(env, callLogId, transcript).catch(e => console.error("Memory extraction failed", e));

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey });

    const prompt = `
Analyze the following phone call transcript between an AI sales agent and a potential customer.
Provide a structured analysis including:
1. Sentiment: positive, neutral, or negative.
2. Lead Score: An integer from 0 to 100 based on purchase intent and business value.
3. Outcome: One of 'interested', 'not-interested', 'follow-up', 'meeting-booked'.
4. Summary: A 1-sentence summary of the conversation.
5. Meeting Booked: Boolean.
6. nextAction: If a follow-up or check-in is needed, suggest the next action. Format: { "type": "whatsapp_message" | "outbound_call", "delayHours": integer, "content": "reason or message draft" }. If no action needed, return null.

Transcript:
"""
${transcript}
"""

Return ONLY a JSON object with the keys: sentiment, leadScore, outcome, summary, meetingBooked, nextAction.
`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });

    const content = (response.content[0] as any).text;
    const result = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1)) as AnalysisResult;

    const db = getDb(env.DATABASE_URL);

    // Update Call Log
    await db.update(callLogs)
      .set({
        sentiment: result.sentiment,
        leadScore: result.leadScore,
        outcome: result.outcome,
        summary: result.summary,
        meetingBooked: result.meetingBooked,
        updatedAt: new Date()
      })
      .where(eq(callLogs.id, callLogId));

    // Update Contact status if it's a high score
    const log = await db.query.callLogs.findFirst({
      where: eq(callLogs.id, callLogId)
    });

    if (log && log.contactId) {
      let status = 'Called';
      let dealStage = 'prospect';
      
      if (result.outcome === 'meeting-booked') {
        status = 'Completed';
        dealStage = 'negotiation';
      } else if (result.leadScore > 70 || result.outcome === 'interested') {
        status = 'Interested';
        dealStage = 'qualified';
      } else if (result.outcome === 'not-interested') {
        status = 'Not Interested';
        dealStage = 'closed_lost';
      }

      await db.update(agentContacts)
        .set({ 
          status,
          dealStage,
          leadScore: result.leadScore,
          updatedAt: new Date(),
          notes: `[Auto-Analysis] ${result.summary}`
        })
        .where(eq(agentContacts.id, log.contactId));

      // Schedule Next Action
      if (result.nextAction && log.agentConfigId) {
        const scheduledTime = new Date();
        scheduledTime.setHours(scheduledTime.getHours() + result.nextAction.delayHours);
        
        const config = await db.query.agentConfigurations.findFirst({
          where: eq(agentConfigurations.id, log.agentConfigId)
        });
        const userId = config?.userId || 'system';

        await db.insert(scheduledTasks).values({
          userId: userId,
          agentConfigId: log.agentConfigId,
          taskType: result.nextAction.type,
          scheduledFor: scheduledTime,
          payload: { contactPhone: log.contactPhone, note: result.nextAction.content },
          status: 'pending'
        });
      }
    }

    return result;
  } catch (error) {
    console.error("[Analysis] Error scoring lead:", error);
    return null;
  }
}
