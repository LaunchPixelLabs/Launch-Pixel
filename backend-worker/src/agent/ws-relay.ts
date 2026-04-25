import { Bindings } from '../index';
import { sketchTools, SketchToolName } from './sketch-tools';

/**
 * WebSocket Relay for Twilio <-> ElevenLabs with integrated tool interception.
 * This provides the < 300ms latency "Sales Monster" performance.
 */
export async function handleVoiceRelay(
  clientWS: WebSocket, 
  env: Bindings, 
  params: { agentId: string; voiceId: string; callSid: string; agent?: any }
) {
  // 1. Establish connection to ElevenLabs
  // We use the voice_id parameter if provided to override the agent's default voice
  const elUrl = new URL(`wss://api.elevenlabs.io/v1/convai/conversation`);
  elUrl.searchParams.set('agent_id', params.agentId);
  if (env.ELEVENLABS_API_KEY) {
    elUrl.searchParams.set('api_key', env.ELEVENLABS_API_KEY);
  }
  
  const elWS = new WebSocket(elUrl.toString());

  // Wait for ElevenLabs to open before we start proxying
  // In a real CF worker, we might need to handle the handshake explicitly
  
  elWS.addEventListener('open', () => {
    console.log(`[Relay] Connected to ElevenLabs for Agent ${params.agentId}`);
    
    // Prepare Steering Context
    const steeringInstructions = params.agent?.steeringInstructions || "";
    const hasCanvas = !!params.agent?.canvasState;
    
    // Initial handshake with dynamic variables for Steering
    elWS.send(JSON.stringify({
      type: "conversation_initiation_client_data",
      conversation_config_override: {
        agent: {
          prompt: {
             prompt: params.agent?.systemPrompt ? `${params.agent.systemPrompt}\n\n[GLOBAL STEERING DOCUMENTS]\n${steeringInstructions}\n\n[WORKFLOW STEERING]\nPrioritize synaptic logic defined in the canvas matrix. Use keywords to trigger high-value actions.` : undefined
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
            result = { error: "Command not found in Sales Monster matrix." };
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
          break;

        case 'user_transcript':
          console.log(`[Relay] User: ${msg.user_transcript.text}`);
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

  // Handle closures
  elWS.addEventListener('close', () => {
    console.log("[Relay] ElevenLabs connection closed.");
    clientWS.close();
  });
  
  clientWS.addEventListener('close', () => {
    elWS.close();
  });
}
