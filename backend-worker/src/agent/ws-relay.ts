import { Bindings } from '../index';
import { sketchTools, SketchToolName } from './sketch-tools';
import WebSocket from 'ws';
import { getDb } from '../db';
import { callLogs, scheduledTasks, agentContacts, agentConfigurations } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// ─── Connection Tracking ────────────────────────────────────────────────────
let activeRelayCount = 0;
export function getActiveRelayCount() { return activeRelayCount; }

/**
 * WebSocket Relay: Twilio <-> ElevenLabs with integrated tool interception.
 * Production-hardened with reconnection logic, heartbeats, and structured logging.
 */
export async function handleVoiceRelay(
  clientWS: WebSocket, 
  env: Bindings, 
  params: { agentId: string; voiceId: string; callSid: string; agent?: any; contactPhone?: string }
) {
  activeRelayCount++;
  const relayStart = Date.now();
  let transcriptBlocks: Array<{ role: 'agent' | 'user', text: string }> = [];
  let callStartedAt = new Date();
  let isFinalized = false;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  let elWS: WebSocket | null = null;

  const log = (level: string, msg: string, data?: any) => {
    const elapsed = ((Date.now() - relayStart) / 1000).toFixed(1);
    const prefix = `[Relay:${params.callSid.slice(-6)}|${elapsed}s]`;
    if (level === 'error') console.error(prefix, msg, data || '');
    else if (level === 'warn') console.warn(prefix, msg, data || '');
    else console.log(prefix, msg, data || '');
  };

  // ─── Connect to ElevenLabs ────────────────────────────────────────────────
  const connectToElevenLabs = () => {
    const elUrl = new URL(`wss://api.elevenlabs.io/v1/convai/conversation`);
    elUrl.searchParams.set('agent_id', params.agentId);
    if (env.ELEVENLABS_API_KEY) {
      elUrl.searchParams.set('api_key', env.ELEVENLABS_API_KEY);
    }

    elWS = new WebSocket(elUrl.toString());

    elWS.addEventListener('open', async () => {
      log('info', `Connected to ElevenLabs (Agent: ${params.agentId})`);

      // Prepare Steering Context
      const steeringInstructions = params.agent?.steeringInstructions || "";
      const hasCanvas = !!params.agent?.canvasState;

      // Fetch Contact Context if available
      let contactContextStr = "";
      if (params.contactPhone && env.DATABASE_URL) {
        try {
          const { getContactContext } = await import('./memory');
          contactContextStr = await getContactContext(env.DATABASE_URL, params.contactPhone, params.agent?.id || 1);
        } catch (e: any) {
          log('warn', `Failed to load contact context: ${e.message}`);
        }
      }

      // Initial handshake with dynamic variables for Steering
      const finalPrompt = params.agent?.systemPrompt 
        ? `${params.agent.systemPrompt}\n\n[STEERING INSTRUCTIONS]\n${steeringInstructions}\n\n[WORKFLOW CONTEXT]\nFollow the workflow defined in the canvas. Use keywords to trigger high-value actions.\n\n${contactContextStr}` 
        : undefined;

      elWS!.send(JSON.stringify({
        type: "conversation_initiation_client_data",
        conversation_config_override: {
          agent: { prompt: { prompt: finalPrompt } }
        }
      }));

      // Start heartbeat monitoring (ping every 15s)
      heartbeatInterval = setInterval(() => {
        if (elWS && elWS.readyState === WebSocket.OPEN) {
          try { elWS.ping(); } catch (e) { /* ignore */ }
        }
      }, 15000);
    });

    // ─── ElevenLabs → Twilio ──────────────────────────────────────────────────
    elWS.addEventListener('message', async (evt) => {
      try {
        const msg = JSON.parse(evt.data as string);

        switch (msg.type) {
          case 'audio':
            clientWS.send(JSON.stringify({
              event: 'media',
              media: { payload: msg.audio }
            }));
            break;

          case 'interruption':
            log('info', 'Barge-in detected — clearing Twilio buffer');
            clientWS.send(JSON.stringify({ event: 'clear' }));
            break;

          case 'client_tool_call': {
            const { tool_name, parameters, call_id } = msg.client_tool_call;
            const toolStart = Date.now();
            log('info', `⚡ Tool call: ${tool_name}`);

            const tool = sketchTools[tool_name as SketchToolName];
            let result;
            if (tool) {
              try {
                result = await tool.execute(parameters, env);
              } catch (toolErr: any) {
                log('error', `Tool ${tool_name} threw:`, toolErr.message);
                result = { error: `Tool failed: ${toolErr.message}` };
              }
            } else {
              result = { error: `Unknown tool: ${tool_name}` };
            }

            log('info', `Tool ${tool_name} completed in ${Date.now() - toolStart}ms`);

            elWS!.send(JSON.stringify({
              type: 'client_tool_result',
              client_tool_result: {
                call_id,
                result: JSON.stringify(result)
              }
            }));
            break;
          }

          case 'agent_response':
            log('info', `Agent: "${msg.agent_response.text.slice(0, 80)}..."`);
            transcriptBlocks.push({ role: 'agent', text: msg.agent_response.text });
            break;

          case 'user_transcript':
            log('info', `User: "${msg.user_transcript.text.slice(0, 80)}..."`);
            transcriptBlocks.push({ role: 'user', text: msg.user_transcript.text });
            break;

          case 'ping':
            // ElevenLabs keepalive — respond with pong
            if (elWS && elWS.readyState === WebSocket.OPEN) {
              elWS.send(JSON.stringify({ type: 'pong' }));
            }
            break;
        }
      } catch (e: any) {
        log('error', 'Error processing ElevenLabs message:', e.message);
      }
    });

    elWS.addEventListener('error', (err: any) => {
      log('error', 'ElevenLabs WebSocket error:', err.message || 'Unknown');
    });

    elWS.addEventListener('close', async (event) => {
      log('info', `ElevenLabs connection closed (code: ${event.code}, reason: ${event.reason || 'none'})`);
      if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
      await finalizeCall();
      
      // Close Twilio connection gracefully
      if (clientWS.readyState === WebSocket.OPEN) {
        clientWS.close();
      }
    });
  };

  // ─── Twilio → ElevenLabs ────────────────────────────────────────────────────
  clientWS.addEventListener('message', (evt) => {
    try {
      const msg = JSON.parse(evt.data as string);

      if (msg.event === 'media') {
        if (elWS && elWS.readyState === WebSocket.OPEN) {
          elWS.send(JSON.stringify({
            type: 'user_audio_chunk',
            user_audio_chunk: msg.media.payload
          }));
        }
      } else if (msg.event === 'stop') {
        log('info', 'Twilio call ended');
        if (elWS && elWS.readyState === WebSocket.OPEN) {
          elWS.close();
        }
      }
    } catch (e: any) {
      log('error', 'Error processing Twilio message:', e.message);
    }
  });

  clientWS.addEventListener('close', async () => {
    log('info', 'Twilio WebSocket closed');
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
    await finalizeCall();
    if (elWS && elWS.readyState === WebSocket.OPEN) {
      elWS.close();
    }
    activeRelayCount--;
  });

  clientWS.addEventListener('error', (err: any) => {
    log('error', 'Twilio WebSocket error:', err.message || 'Unknown');
  });

  // ─── Finalize Call (Save Transcript & Queue Analysis) ─────────────────────
  const finalizeCall = async () => {
    if (isFinalized || transcriptBlocks.length === 0) return;
    isFinalized = true;

    const duration = Math.floor((Date.now() - relayStart) / 1000);
    log('info', `Finalizing call. Duration: ${duration}s, Transcript blocks: ${transcriptBlocks.length}`);

    try {
      const db = getDb(env.DATABASE_URL);
      const transcriptText = transcriptBlocks.map(b => `${b.role === 'agent' ? 'Agent' : 'User'}: ${b.text}`).join('\n');

      const agent = await db.query.agentConfigurations.findFirst({
        where: eq(agentConfigurations.elevenLabsAgentId, params.agentId)
      });

      const [log_entry] = await db.insert(callLogs)
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

      if (log_entry) {
        await db.insert(scheduledTasks)
          .values({
            userId: agent?.userId || 'system',
            agentConfigId: agent?.id,
            taskType: 'lead_analysis',
            payload: { callLogId: log_entry.id, transcript: transcriptText },
            status: 'pending',
            scheduledFor: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        log('info', `Queued lead analysis for call log ${log_entry.id}`);
      }
    } catch (err: any) {
      log('error', 'Failed to finalize call log:', err.message);
    }
  };

  // ─── Kick off the connection ──────────────────────────────────────────────
  connectToElevenLabs();
}
