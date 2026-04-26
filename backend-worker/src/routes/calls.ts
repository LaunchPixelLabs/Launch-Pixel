import { Hono } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { agentConfigurations } from '../db/schema';
import { eq } from 'drizzle-orm';

const callRoutes = new Hono<{ Bindings: Bindings }>();

// TwiML Endpoint
callRoutes.post('/twiml', async (c) => {
  const body = await c.req.parseBody();
  const calledNumber = (body.Called as string) || '';
  const callSid = (body.CallSid as string) || 'unknown';

  const callerNumber = (body.From as string) || (body.Caller as string) || '';

  let targetAgentId = c.env.ELEVENLABS_AGENT_ID;
  let targetVoiceId = 'rachel';
  let configId = '';

  if (calledNumber && c.env.DATABASE_URL) {
    const db = getDb(c.env.DATABASE_URL);
    const agent = await db.query.agentConfigurations.findFirst({
      where: eq(agentConfigurations.assignedPhoneNumber, calledNumber)
    });
    if (agent) {
      if (agent.elevenLabsAgentId) targetAgentId = agent.elevenLabsAgentId;
      if (agent.voiceId) targetVoiceId = agent.voiceId;
      configId = agent.id.toString();
    }
  }

  const host = c.req.header('host');
  const encodedPhone = encodeURIComponent(callerNumber);
  const relayUrl = `wss://${host}/api/call/relay?agentId=${targetAgentId}&voiceId=${targetVoiceId}&callSid=${callSid}&contactPhone=${encodedPhone}&configId=${configId}`;
  
  return c.text(`<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="${relayUrl}"><Parameter name="api_key" value="${c.env.ELEVENLABS_API_KEY}" /></Stream></Connect></Response>`, 200, { 'Content-Type': 'text/xml' });
});


export default callRoutes;
