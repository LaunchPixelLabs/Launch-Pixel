import { Context } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { agentConfigurations } from '../db/schema';
import { eq } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';

const EMOTIONAL_IQ_PROMPT = `
[EMOTIONAL_IQ_PROTOCOL]
- Modulate your voice tone to match the user's energy.
- Use natural filler words (e.g., "uh-huh", "got it", "right") to sound human.
- If the user tells a joke or something lighthearted, respond with a subtle chuckle or laugh before replying.
- Be contextually aware of the emotional state of the user. If they are frustrated, be empathetic. If they are excited, be enthusiastic.
`;

/**
 * Deploys an agent configuration to a specific stage (test or production).
 * Uses Claude to optimize the final system prompt for ElevenLabs.
 */
export async function deployAgent(c: Context<{ Bindings: Bindings }>) {
  const { id } = c.req.param();
  const { stage } = await c.req.json() as { stage: 'test' | 'production' };
  
  if (!id || !['test', 'production'].includes(stage)) {
    return c.json({ error: 'Invalid ID or stage' }, 400);
  }

  const db = getDb(c.env.DATABASE_URL);
  const config = await db.query.agentConfigurations.findFirst({
    where: eq(agentConfigurations.id, parseInt(id))
  });

  if (!config) {
    return c.json({ error: 'Configuration not found' }, 404);
  }

  try {
    // 1. Brain Optimization: Use Claude to refine the prompt for the specific stage
    const anthropic = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY || c.env.ANTHROPIC_ADMIN_KEY || '' });
    
    const optimizationResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 2000,
      system: "You are a specialized prompt engineer for Voice AI. Your goal is to take a draft system prompt and enhance it with clear instructions for a voice-first interaction, including emotional cues, handling interruptions, and maintaining a high-performance sales persona.",
      messages: [
        { 
          role: "user", 
          content: `Optimize this prompt for a ${stage} environment. Include the Emotional IQ protocol.\n\nDraft Prompt: ${config.systemPrompt}\n\nCanvas Workflow Context: ${JSON.stringify(config.canvasState)}`
        }
      ]
    });

    const optimizedPrompt = (optimizationResponse.content[0] as any).text + "\n" + EMOTIONAL_IQ_PROMPT;

    // 2. Sync with ElevenLabs
    let elevenLabsAgentId = config.elevenLabsAgentId;
    if (c.env.ELEVENLABS_API_KEY) {
      if (!elevenLabsAgentId) {
        // AUTO-CREATE: Provision a new agent on ElevenLabs if missing
        console.log("[Deploy] Creating new ElevenLabs agent...");
        const createRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/create`, {
          method: 'POST',
          headers: {
            'xi-api-key': c.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: config.name || "Matrix Agent",
            conversation_config: {
              agent: {
                prompt: { prompt: optimizedPrompt },
                first_message: config.firstMessage,
                language: config.language || 'en'
              },
              asr: { quality: "high" },
              turn: { turn_timeout: 3.0 }
            }
          }),
        });

        if (createRes.ok) {
          const createData = await createRes.json() as any;
          elevenLabsAgentId = createData.agent_id;
          console.log("[Deploy] Successfully created ElevenLabs agent:", elevenLabsAgentId);
          
          // Persist the new ID immediately
          await db.update(agentConfigurations)
            .set({ elevenLabsAgentId })
            .where(eq(agentConfigurations.id, config.id));
        } else {
          const error = await createRes.text();
          console.error("[Deploy] ElevenLabs creation failed:", error);
          // Don't throw, maybe we can still update DB status
        }
      } else {
        // UPDATE: Sync optimized prompt to existing agent
        const elRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenLabsAgentId}`, {
          method: 'PATCH',
          headers: {
            'xi-api-key': c.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_config: {
              agent: {
                prompt: { prompt: optimizedPrompt },
                first_message: config.firstMessage,
                language: config.language
              }
            }
          }),
        });

        if (!elRes.ok) {
          const error = await elRes.text();
          console.error("[Deploy] ElevenLabs sync failed:", error);
        }
      }
    }

    // 3. Update DB
    await db.update(agentConfigurations)
      .set({ 
        deploymentStatus: stage,
        lastDeployedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(agentConfigurations.id, parseInt(id)));

    return c.json({ 
      success: true, 
      message: `Agent successfully deployed to ${stage}`,
      version: config.version,
      optimizedPrompt: optimizedPrompt.substring(0, 100) + "..."
    });

  } catch (error: any) {
    console.error("[Deploy] Error:", error);
    return c.json({ error: 'Deployment failed', details: error.message }, 500);
  }
}
