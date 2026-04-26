import { Bindings } from '../index';
import { sketchTools, SketchToolName } from './sketch-tools';
import WebSocket from 'ws';
import { getDb } from '../db';
import { callLogs, scheduledTasks, agentContacts, agentConfigurations } from '../db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * WebSocket Relay: Twilio <-> ElevenLabs with integrated tool interception.
 */
export async function handleVoiceRelay(
  clientWS: WebSocket, 
  env: Bindings, 
  params: { agentId: string; voiceId: string; callSid: string; agent?: any; contactPhone?: string }
) {
  let transcriptBlocks: Array<{ role: 'agent' | 'user', text: string }> = [];
  let callStartedAt = new Date();
  
  // 1. Establish connection to ElevenLabs
  const elUrl = new URL(`wss://api.elevenlabs.io/v1/convai/conversation`);
  elUrl.searchParams.set('agent_id', params.agentId);
  if (env.ELEVENLABS_API_KEY) {
    elUrl.searchParams.set('api_key', env.ELEVENLABS_API_KEY);
  }
  
  const elWS = new WebSocket(elUrl.toString());

  elWS.addEventListener('open', async () => {
    console.log(`[Relay] Connected to ElevenLabs for Agent ${params.agentId}`);
    
    // Prepare Steering Context
    const steeringInstructions = params.agent?.steeringInstructions || "";
    const hasCanvas = !!params.agent?.canvasState;
    
    // Fetch Contact Context if available
    let contactContextStr = "";
    if (params.contactPhone && env.DATABASE_URL) {
      const { getContactContext } = await import('./memory');
      contactContextStr = await getContactContext(env.DATABASE_URL, params.contactPhone, params.agent?.id || 1);
    }
    
    // Initial handshake with dynamic variables for Steering
    const finalPrompt = params.agent?.systemPrompt ? `${params.agent.systemPrompt}\n\n[STEERING INSTRUCTIONS]\n${steeringInstructions}\n\n[WORKFLOW CONTEXT]\nFollow the workflow defined in the canvas. Use keywords to trigger high-value actions.\n\n${contactContextStr}` : undefined;
    
    elWS.send(JSON.stringify({
      type: "conversation_initiation_client_data",
      conversation_config_override: {
        agent: {
          prompt: {
             prompt: finalPrompt
          }
        }
      }
    }));
  });

  // --- ELEVENLABS -> TWILIO ---
  elWS.addEventListener('message', async (evt) => {
    try {
      const msg = JSON.parse(evt.data as string);

      switch (msg.type) {
        case 'audio':
          // Pass audio frames directly to Twilio
          clientWS.send(JSON.stringify({
            event: 'media',
            media: {
              payload: msg.audio
            }
          }));
          break;

        case 'interruption':
          // Tell Twilio to clear its audio buffer immediately
          clientWS.send(JSON.stringify({ event: 'clear' }));
          break;

        case 'client_tool_call':
          const { tool_name, parameters, call_id } = msg.client_tool_call;
          console.log(`[Relay] ⚡ In-memory Tool Execution: ${tool_name}`);
          
          const tool = sketchTools[tool_name as SketchToolName];
          let result;
          if (tool) {
            // High-speed local execution (0ms network hop)
            result = await tool.execute(parameters, env);
          } else {
            result = { error: `Unknown tool: ${tool_name}` };
          }

          // Send result back to ElevenLabs brain instantly
          elWS.send(JSON.stringify({
            type: 'client_tool_result',
            client_tool_result: {
              call_id,
              result: JSON.stringify(result)
            }
          }));
          break;

        case 'agent_response':
          console.log(`[Relay] Agent: ${msg.agent_response.text}`);
          transcriptBlocks.push({ role: 'agent', text: msg.agent_response.text });
          break;
        case 'user_transcript':
          console.log(`[Relay] User: ${msg.user_transcript.text}`);
          transcriptBlocks.push({ role: 'user', text: msg.user_transcript.text });
          break;
      }
    } catch (e) {
      console.error("[Relay] Error processing ElevenLabs message:", e);
    }
  });

  // --- TWILIO -> ELEVENLABS ---
  clientWS.addEventListener('message', (evt) => {
    try {
      const msg = JSON.parse(evt.data as string);

      if (msg.event === 'media') {
        // Forward user audio to ElevenLabs
        if (elWS.readyState === WebSocket.OPEN) {
          elWS.send(JSON.stringify({
            type: 'user_audio_chunk',
            user_audio_chunk: msg.media.payload
          }));
        }
      } else if (msg.event === 'stop') {
        console.log("[Relay] Twilio call ended.");
        elWS.close();
      }
    } catch (e) {
      console.error("[Relay] Error processing Twilio message:", e);
    }
  });

  // Handle closures & Save Data
  const finalizeCall = async () => {
    if (transcriptBlocks.length === 0) return;
    
    console.log(`[Relay] Finalizing call ${params.callSid}. Saving transcript...`);
    const db = getDb(env.DATABASE_URL);
    const transcriptText = transcriptBlocks.map(b => `${b.role === 'agent' ? 'Agent' : 'User'}: ${b.text}`).join('\n');
    const duration = Math.floor((new Date().getTime() - callStartedAt.getTime()) / 1000);

    try {
      // 1. Identify Agent & Contact
      const agent = await db.query.agentConfigurations.findFirst({
        where: eq(agentConfigurations.elevenLabsAgentId, params.agentId)
      });

      // 2. Create or Update Call Log
      const [log] = await db.insert(callLogs)
        .values({
          callSid: params.callSid,
          agentConfigId: agent?.id,
          userId: agent?.userId,
          direction: 'outbound',
          status: 'completed',
          duration,
          transcript: transcriptText,
          contactPhone: params.contactPhone || 'unknown',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [callLogs.callSid],
          set: {
            transcript: transcriptText,
            duration,
            status: 'completed',
            updatedAt: new Date()
          }
        })
        .returning();

      // 3. Queue Lead Analysis Task
      if (log) {
        await db.insert(scheduledTasks)
          .values({
            userId: agent?.userId || 'system',
            agentConfigId: agent?.id,
            taskType: 'lead_analysis',
            payload: { callLogId: log.id, transcript: transcriptText },
            status: 'pending',
            scheduledFor: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        console.log(`[Relay] Queued lead analysis for log ${log.id}`);
      }
    } catch (err) {
      console.error("[Relay] Failed to finalize call log:", err);
    }
  };

  elWS.addEventListener('close', async () => {
    console.log("[Relay] ElevenLabs connection closed.");
    await finalizeCall();
    clientWS.close();
  });
  
  clientWS.addEventListener('close', async () => {
    await finalizeCall();
    elWS.close();
  });
}
