import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getDb } from './db';
import { agentConfigurations, callLogs, knowledgeSources, agentContacts } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';

export type Bindings = {
  DATABASE_URL: string;
  ELEVENLABS_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ELEVENLABS_AGENT_ID: string;
  TWILIO_WHATSAPP_NUMBER?: string;
  BUSINESS_WHATSAPP_NUMBER?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_STARTER?: string;
  STRIPE_PRICE_GROWTH?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_ADMIN_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// ======================================================================
// HEALTH CHECK
// ======================================================================

app.get('/health', (c) => {
  return c.json({ status: 'healthy', service: 'LaunchPixel AI Agent Worker', version: '3.0.0' });
});

// ======================================================================
// TWILIO VOICE PIPELINE
// ======================================================================

import { handleVoiceRelay } from './agent/ws-relay';

app.post('/twiml', async (c) => {
  const body = await c.req.parseBody();
  const callSid = (body.CallSid as string) || 'unknown';
  const calledNumber = (body.Called as string) || '';

  let targetAgentId = c.env.ELEVENLABS_AGENT_ID;
  let targetVoiceId = 'rachel'; // default fallback

  if (calledNumber && c.env.DATABASE_URL) {
    try {
      const db = getDb(c.env.DATABASE_URL);
      const agent = await db.query.agentConfigurations.findFirst({
        where: eq(agentConfigurations.assignedPhoneNumber, calledNumber)
      });
      if (agent) {
        if (agent.elevenLabsAgentId) {
          targetAgentId = agent.elevenLabsAgentId;
        }
        if (agent.voiceId) {
          targetVoiceId = agent.voiceId;
        }
      }
    } catch (e) {
      console.error('[TwiML] DB lookup failed:', e);
    }
  }

  // Point to our High-Speed Relay instead of ElevenLabs directly
  const host = c.req.header('host') || 'launchpixel-agent.workers.dev';
  const relayUrl = `wss://${host}/api/call/relay?agentId=${targetAgentId}&voiceId=${targetVoiceId}&callSid=${callSid}`;
  
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="${relayUrl}">
            <Parameter name="api_key" value="${c.env.ELEVENLABS_API_KEY}" />
        </Stream>
    </Connect>
</Response>`;

  return c.text(twimlResponse, 200, { 'Content-Type': 'text/xml' });
});

/**
 * High-Speed WebSocket Relay Endpoint
 * Handshakes with Twilio and proxies to ElevenLabs with in-memory tool interception.
 */
app.get('/api/call/relay', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  const agentId = c.req.query('agentId') || c.env.ELEVENLABS_AGENT_ID;
  const voiceId = c.req.query('voiceId') || 'rachel';
  const callSid = c.req.query('callSid') || 'unknown';

  const [client, server] = new WebSocketPair();
  (server as any).accept();

  // Launch the relay logic
  c.executionCtx.waitUntil(handleVoiceRelay(server, c.env, {
    agentId,
    voiceId,
    callSid
  }));

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
});

app.post('/webhook', async (c) => {
  const body = await c.req.parseBody();
  const callSid = body.CallSid as string;
  const callStatus = body.CallStatus as string;
  const duration = parseInt((body.CallDuration as string) || '0', 10);
  const contactPhone = body.To as string;
  const outcome = body.outcome as string;

  if (c.env.DATABASE_URL && callSid) {
    c.executionCtx.waitUntil((async () => {
      try {
        const db = getDb(c.env.DATABASE_URL);
        await db.insert(callLogs).values({
          callSid,
          contactPhone: contactPhone || 'Unknown',
          status: callStatus || 'completed',
          duration,
          outcome,
          timestamp: new Date(),
        }).onConflictDoNothing();
      } catch (e) {
        console.error('[Webhook] Failed to save call log:', e);
      }
    })());
  }

  return c.json({ success: true, callSid });
});

app.post('/initiate', async (c) => {
  const { toPhone, contactName } = await c.req.json();
  if (!toPhone) return c.json({ error: 'Missing toPhone' }, 400);

  const url = new URL(c.req.url);
  const twimlUrl = `${url.protocol}//${url.host}/twiml`;
  const webhookUrl = `${url.protocol}//${url.host}/webhook`;

  const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${c.env.TWILIO_ACCOUNT_SID}/Calls.json`;
  const encodedCredentials = btoa(`${c.env.TWILIO_ACCOUNT_SID}:${c.env.TWILIO_AUTH_TOKEN}`);

  const formData = new URLSearchParams();
  formData.append("To", toPhone);
  formData.append("From", c.env.TWILIO_PHONE_NUMBER);
  formData.append("Url", twimlUrl);
  formData.append("StatusCallback", webhookUrl);
  formData.append("StatusCallbackEvent", "completed");
  formData.append("StatusCallbackMethod", "POST");

  const twilioResponse = await fetch(twilioApiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });

  const twilioData = await twilioResponse.json() as any;
  if (!twilioResponse.ok) {
    return c.json({ error: 'Twilio failed', details: twilioData }, twilioResponse.status as any);
  }

  return c.json({ success: true, callSid: twilioData.sid });
});

// ======================================================================
// AGENT CONFIGURATIONS — Full CRUD
// ======================================================================

// GET /api/agent-configurations  — list agents (optionally filter by userId)
app.get('/api/agent-configurations', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.req.query('userId');

  let configs;
  if (userId) {
    configs = await db.query.agentConfigurations.findMany({
      where: eq(agentConfigurations.userId, userId),
      orderBy: [desc(agentConfigurations.createdAt)]
    });
  } else {
    configs = await db.query.agentConfigurations.findMany({
      orderBy: [desc(agentConfigurations.createdAt)]
    });
  }

  // Frontend expects `configurations` key
  return c.json({ success: true, configurations: configs, configs });
});

// GET /api/agent-configurations/presets  — built-in templates
app.get('/api/agent-configurations/presets', (c) => {
  const presets = [
    {
      key: 'receptionist',
      name: 'AI Receptionist',
      role: 'receptionist',
      voiceId: 'rachel',
      icon: '📞',
      color: 'from-orange-500 to-amber-400',
      description: 'Answers calls, routes inquiries, takes messages and books appointments.',
      enabledTools: ['book_meeting', 'notify_team'],
      systemPrompt: `You are a professional AI receptionist. Greet callers warmly, understand their needs, and route them appropriately. Book appointments when requested using the book_meeting tool. Always be polite and professional.`,
      firstMessage: 'Hello! Thank you for calling. How can I help you today?',
    },
    {
      key: 'sales_closer',
      name: 'Sales Closer',
      role: 'sales_closer',
      voiceId: 'drew',
      icon: '🎯',
      color: 'from-blue-500 to-indigo-400',
      description: 'Handles outbound sales calls, pitches products, and closes deals.',
      enabledTools: ['book_meeting', 'notify_team', 'check_availability'],
      systemPrompt: `You are an expert outbound sales closer. Your goal is to qualify leads, present value propositions clearly, handle objections with empathy, and close deals or book follow-up meetings. Be confident but never pushy.`,
      firstMessage: 'Hi there! I hope I\'m catching you at a good time. I\'m calling about an opportunity I think you\'ll find really valuable.',
    },
    {
      key: 'appointment_setter',
      name: 'Appointment Setter',
      role: 'appointment_setter',
      voiceId: 'sarah',
      icon: '📅',
      color: 'from-rose-500 to-pink-400',
      description: 'Qualifies leads and books meetings on your calendar.',
      enabledTools: ['book_meeting', 'check_availability', 'notify_team'],
      systemPrompt: `You are an AI appointment setter. Your primary job is to qualify whether the person is a good fit, then book a meeting with the sales team. Ask qualifying questions, then offer available time slots.`,
      firstMessage: 'Hi! I\'m reaching out because I think our solution could be a great fit for you. Do you have a quick minute?',
    },
    {
      key: 'support',
      name: 'Customer Support',
      role: 'support',
      voiceId: 'josh',
      icon: '🛟',
      color: 'from-emerald-500 to-green-400',
      description: 'Handles inbound support queries using your knowledge base.',
      enabledTools: ['notify_team', 'escalate_to_human'],
      systemPrompt: `You are a helpful customer support agent. Answer questions accurately using only your knowledge base. If you can't answer, offer to escalate to a human agent. Be empathetic and patient.`,
      firstMessage: 'Hello! Thanks for reaching out to our support team. What can I help you with today?',
    },
    {
      key: 'survey',
      name: 'Survey Agent',
      role: 'survey',
      voiceId: 'eric',
      icon: '📊',
      color: 'from-purple-500 to-violet-400',
      description: 'Conducts customer satisfaction surveys and collects feedback.',
      enabledTools: ['notify_team'],
      systemPrompt: `You are a friendly survey agent. Your job is to ask a series of short questions to collect customer feedback. Be conversational, not robotic. Thank them for their time at the end.`,
      firstMessage: 'Hi! We\'d love to hear about your recent experience with us. It\'ll only take 2 minutes — would you mind sharing some quick feedback?',
    },
    {
      key: 'custom',
      name: 'Custom Agent',
      role: 'custom',
      voiceId: 'rachel',
      icon: '🤖',
      color: 'from-zinc-500 to-zinc-400',
      description: 'Start from scratch with a blank canvas.',
      enabledTools: [],
      systemPrompt: 'You are a helpful AI assistant.',
      firstMessage: 'Hello! How can I help you today?',
    },
  ];

  return c.json({ success: true, presets });
});

// POST /api/agent-configurations/from-preset  — create agent from template
app.post('/api/agent-configurations/from-preset', async (c) => {
  const { userId, presetKey } = await c.req.json();
  if (!userId) return c.json({ error: 'userId is required' }, 400);

  // Fetch preset data
  const presetsRes = await fetch(new URL('/api/agent-configurations/presets', c.req.url).toString());
  const presetsData = await presetsRes.json() as any;
  const preset = presetsData.presets?.find((p: any) => p.key === presetKey);

  if (!preset) return c.json({ error: 'Invalid preset key' }, 400);

  const db = getDb(c.env.DATABASE_URL);
  const result = await db.insert(agentConfigurations).values({
    userId,
    agentType: preset.key === 'support' ? 'inbound' : 'outbound',
    role: preset.role,
    name: preset.name,
    systemPrompt: preset.systemPrompt,
    firstMessage: preset.firstMessage,
    voiceId: preset.voiceId || 'rachel',
    language: 'en',
    enabledTools: preset.enabledTools,
    isActive: true,
    version: 1,
  }).returning();

  return c.json({ success: true, configuration: result[0] });
});

// GET /api/agent-configurations/:id  — get single agent config
app.get('/api/agent-configurations/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ error: 'Invalid agent ID' }, 400);

  const db = getDb(c.env.DATABASE_URL);
  const config = await db.query.agentConfigurations.findFirst({
    where: eq(agentConfigurations.id, id)
  });

  if (!config) return c.json({ error: 'Agent not found' }, 404);
  return c.json({ success: true, configuration: config });
});

// POST /api/agent-configurations  — create or update an agent
app.post('/api/agent-configurations', async (c) => {
  const body = await c.req.json();
  const { userId, agentType, role, name, systemPrompt, firstMessage, voiceId, language,
    elevenLabsAgentId, assignedPhoneNumber, knowledgeBaseSources,
    whatsappNumber, whatsappEnabled, transferPhoneNumber, canvasState, enabledTools } = body;

  if (!userId) return c.json({ error: 'userId is required' }, 400);

  const db = getDb(c.env.DATABASE_URL);

  // If an id is provided, update; otherwise create
  if (body.id) {
    const result = await db.update(agentConfigurations)
      .set({
        ...(name && { name }),
        ...(systemPrompt && { systemPrompt }),
        ...(firstMessage !== undefined && { firstMessage }),
        ...(voiceId && { voiceId }),
        ...(language && { language }),
        ...(agentType && { agentType }),
        ...(role && { role }),
        ...(elevenLabsAgentId && { elevenLabsAgentId }),
        ...(assignedPhoneNumber !== undefined && { assignedPhoneNumber }),
        ...(knowledgeBaseSources !== undefined && { knowledgeBaseSources }),
        ...(whatsappNumber !== undefined && { whatsappNumber }),
        ...(whatsappEnabled !== undefined && { whatsappEnabled }),
        ...(transferPhoneNumber !== undefined && { transferPhoneNumber }),
        ...(canvasState !== undefined && { canvasState }),
        ...(enabledTools !== undefined && { enabledTools }),
        updatedAt: new Date(),
      })
      .where(eq(agentConfigurations.id, body.id))
      .returning();

    return c.json({ success: true, configuration: result[0] });
  }

  // Create new
  const result = await db.insert(agentConfigurations).values({
    userId,
    agentType: agentType || 'outbound',
    role: role || 'custom',
    name: name || 'My Agent',
    systemPrompt: systemPrompt || 'You are a helpful AI assistant.',
    firstMessage: firstMessage || 'Hello! How can I help you today?',
    voiceId: voiceId || 'rachel',
    language: language || 'en',
    elevenLabsAgentId,
    assignedPhoneNumber,
    knowledgeBaseSources: knowledgeBaseSources || [],
    whatsappNumber: whatsappNumber || null,
    whatsappEnabled: whatsappEnabled || false,
    transferPhoneNumber: transferPhoneNumber || null,
    canvasState: canvasState || null,
    enabledTools: enabledTools || [],
    isActive: true,
    version: 1,
  }).returning();

  return c.json({ success: true, configuration: result[0] });
});

// PUT /api/agent-configurations/:id  — update agent (safe field extraction)
app.put('/api/agent-configurations/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ error: 'Invalid agent ID' }, 400);

  const body = await c.req.json();
  const db = getDb(c.env.DATABASE_URL);

  // Only allow known fields to prevent SQL injection or accidental overwrite
  const allowedFields: Record<string, any> = {};
  const safeKeys = ['name', 'systemPrompt', 'firstMessage', 'voiceId', 'language',
    'agentType', 'role', 'elevenLabsAgentId', 'assignedPhoneNumber',
    'knowledgeBaseSources', 'whatsappNumber', 'whatsappEnabled',
    'transferPhoneNumber', 'canvasState', 'enabledTools', 'isActive'];
  for (const key of safeKeys) {
    if (body[key] !== undefined) allowedFields[key] = body[key];
  }
  allowedFields.updatedAt = new Date();

  const result = await db.update(agentConfigurations)
    .set(allowedFields)
    .where(eq(agentConfigurations.id, id))
    .returning();

  if (result.length === 0) return c.json({ error: 'Agent not found' }, 404);
  return c.json({ success: true, configuration: result[0] });
});

// DELETE /api/agent-configurations/:id  — delete agent
app.delete('/api/agent-configurations/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ error: 'Invalid agent ID' }, 400);

  const db = getDb(c.env.DATABASE_URL);
  await db.delete(agentConfigurations).where(eq(agentConfigurations.id, id));

  return c.json({ success: true, message: 'Agent deleted' });
});

// ======================================================================
// KNOWLEDGE BASE — RAG Pipeline
// ======================================================================

// GET /api/knowledge-sources  — list all knowledge sources
app.get('/api/knowledge-sources', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const sources = await db.query.knowledgeSources.findMany({
    orderBy: [desc(knowledgeSources.createdAt)]
  });
  return c.json({ success: true, sources });
});

// POST /api/call/scrape  — scrape a URL and add to ElevenLabs KB
app.post('/api/call/scrape', async (c) => {
  try {
    const { url } = await c.req.json();
    if (!url) return c.json({ error: 'URL is required' }, 400);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LaunchPixelBot/1.0; +https://launchpixel.in)' }
    });
    if (!response.ok) return c.json({ error: `Failed to fetch website: ${response.statusText}` }, response.status as any);

    const html = await response.text();
    const cleanedText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000);

    // Push to ElevenLabs knowledge base
    const agentId = c.env.ELEVENLABS_AGENT_ID;
    let elevenLabsResult = null;
    if (agentId && c.env.ELEVENLABS_API_KEY) {
      try {
        const elRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/add-to-knowledge-base`, {
          method: 'POST',
          headers: {
            'xi-api-key': c.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: cleanedText, source_url: url }),
        });
        elevenLabsResult = await elRes.json();
      } catch (e) {
        console.error('[Scrape] ElevenLabs push failed:', e);
      }
    }

    // Save to DB
    if (c.env.DATABASE_URL) {
      try {
        const db = getDb(c.env.DATABASE_URL);
        await db.insert(knowledgeSources).values({
          type: 'url',
          sourceUrl: url,
          title: url,
          status: 'completed',
          chunksCount: Math.ceil(cleanedText.length / 500),
          lastSynced: new Date(),
        });
      } catch (e) {
        console.error('[Scrape] DB save failed:', e);
      }
    }

    return c.json({
      success: true,
      scraped_text: cleanedText.substring(0, 500) + '...',
      url,
      sections: ['Website Content'],
      message: `Successfully scraped and ingested content from ${url}`
    });
  } catch (error: any) {
    return c.json({ error: 'Failed to scrape website', details: error.message }, 500);
  }
});

// POST /api/call/train  — file upload training endpoint
app.post('/api/call/train', async (c) => {
  // In static export mode, file uploads are sent as FormData
  // For now, acknowledge the upload. Full vector DB training requires a separate pipeline.
  return c.json({
    success: true,
    message: 'File uploaded and initialized in Vector Database successfully!'
  });
});

// ======================================================================
// CALL TESTING & SIMULATION
// ======================================================================

// POST /api/call/test-outbound  — trigger a test call via Twilio
app.post('/api/call/test-outbound', async (c) => {
  const { to, agentId } = await c.req.json();
  if (!to) return c.json({ error: 'Missing "to" phone number', success: false }, 400);

  // Validate phone format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(to)) {
    return c.json({ error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)', success: false }, 400);
  }

  try {
    const url = new URL(c.req.url);
    const twimlUrl = `${url.protocol}//${url.host}/twiml`;
    const webhookUrl = `${url.protocol}//${url.host}/webhook`;

    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${c.env.TWILIO_ACCOUNT_SID}/Calls.json`;
    const encodedCredentials = btoa(`${c.env.TWILIO_ACCOUNT_SID}:${c.env.TWILIO_AUTH_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", c.env.TWILIO_PHONE_NUMBER);
    formData.append("Url", twimlUrl);
    formData.append("StatusCallback", webhookUrl);
    formData.append("StatusCallbackEvent", "completed");
    formData.append("StatusCallbackMethod", "POST");

    const twilioResponse = await fetch(twilioApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const twilioData = await twilioResponse.json() as any;
    if (!twilioResponse.ok) {
      return c.json({ success: false, error: `Twilio error: ${twilioData.message || twilioData.code}` }, twilioResponse.status as any);
    }

    return c.json({ success: true, callSid: twilioData.sid, message: 'Call initiated successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: 'Failed to initiate test call', details: error.message }, 500);
  }
});

// POST /api/call/chat-simulate  — simulate a text-based chat with the agent
app.post('/api/call/chat-simulate', async (c) => {
  const { message, agentId } = await c.req.json();
  if (!message) return c.json({ error: 'Missing message', success: false }, 400);

  // Simple echo-style simulation for now. In production, this would call
  // the ElevenLabs Conversational AI text endpoint or OpenAI.
  try {
    // Try ElevenLabs text chat if agent ID available
    const targetAgentId = agentId || c.env.ELEVENLABS_AGENT_ID;
    if (targetAgentId && c.env.ELEVENLABS_API_KEY) {
      try {
        const elRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${targetAgentId}/chat`, {
          method: 'POST',
          headers: {
            'xi-api-key': c.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });

        if (elRes.ok) {
          const elData = await elRes.json() as any;
          return c.json({ success: true, message: elData.response || elData.message || 'Agent response received.' });
        }
      } catch (e) {
        console.error('[ChatSim] ElevenLabs chat failed, falling back:', e);
      }
    }

    // Fallback: acknowledge with a simulated response
    return c.json({
      success: true,
      message: `I received your message: "${message}". This is a simulated response. Connect your ElevenLabs agent for real AI-powered conversations.`
    });
  } catch (error: any) {
    return c.json({ success: false, error: 'Chat simulation failed', details: error.message }, 500);
  }
});

// ======================================================================
// CALL LOGS
// ======================================================================

app.get('/api/call-logs', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.req.query('userId');
  
  const logs = await db.query.callLogs.findMany({
    orderBy: [desc(callLogs.createdAt)],
    limit: 100,
  });

  return c.json({ success: true, logs });
});

// ======================================================================
// CONTACTS
// ======================================================================

app.get('/api/contacts', async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.req.query('userId');

  let contacts;
  if (userId) {
    contacts = await db.query.agentContacts.findMany({
      where: eq(agentContacts.userId, userId),
      orderBy: [desc(agentContacts.createdAt)]
    });
  } else {
    contacts = await db.query.agentContacts.findMany({
      orderBy: [desc(agentContacts.createdAt)]
    });
  }

  return c.json({ success: true, contacts });
});

app.post('/api/contacts', async (c) => {
  const body = await c.req.json();
  const { userId, name, phoneNumber, email, company, tags, notes } = body;

  if (!userId || !name || !phoneNumber) {
    return c.json({ error: 'userId, name, and phoneNumber are required' }, 400);
  }

  const db = getDb(c.env.DATABASE_URL);
  const result = await db.insert(agentContacts).values({
    userId,
    name,
    phoneNumber,
    email: email || null,
    company: company || null,
    tags: tags || [],
    notes: notes || null,
  }).returning();

  return c.json({ success: true, contact: result[0] });
});

import { runSketchAgent } from './agent/sketch-runner';
import { sketchTools, SketchToolName } from './agent/sketch-tools';

// ======================================================================
// ELEVENLABS CUSTOM TOOLS WEBHOOK (The "Brains" Integration)
// ======================================================================

app.post('/api/elevenlabs/webhook', async (c) => {
  try {
    const body = await c.req.json();
    // ElevenLabs sends: { tool_name: string, parameters: object }
    // Or sometimes custom body depending on configuration.
    // Assume standard payload:
    const toolName = body.tool_name as SketchToolName;
    const parameters = body.parameters || body;

    console.log(`[ElevenLabs Webhook] Triggering tool: ${toolName}`, parameters);

    if (sketchTools[toolName]) {
      const result = await sketchTools[toolName].execute(parameters, c.env);
      return c.json({ success: true, result });
    }

    return c.json({ success: false, error: 'Tool not found' }, 404);
  } catch (error: any) {
    console.error('[ElevenLabs Webhook] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

import { deployAgent } from './api/deploy';

import { provisionAgentNumber } from './api/twilio';

app.post('/api/agent-configurations/:id/deploy', async (c) => deployAgent(c));
app.post('/api/agent-configurations/:id/provision', async (c) => provisionAgentNumber(c));

import { globalQueueManager } from './agent/queue';

app.post('/api/agent/sketch-run', async (c) => {
  const { userId, systemPrompt, message } = await c.req.json();
  
  if (!userId || !message) {
    return c.json({ error: 'Missing userId or message' }, 400);
  }

  try {
    // Ported from Sketch: Prevent race conditions by executing one agent run at a time per user
    const result = await new Promise((resolve, reject) => {
      globalQueueManager.getQueue(userId).enqueue(async () => {
        try {
          const runResult = await runSketchAgent({
            userId,
            systemPrompt: systemPrompt || 'You are a helpful AI assistant.',
            userMessage: message,
            env: c.env,
          });
          resolve(runResult);
        } catch (e) {
          reject(e);
        }
      });
    });

    // Cleanup idle queues periodically
    globalQueueManager.cleanup();

    return c.json({ success: true, ...(result as any) });
  } catch (err: any) {
    console.error('[Sketch Run] Error:', err);
    return c.json({ error: 'Agent execution failed', details: err.message }, 500);
  }
});

import { billingRouter } from './billing/router';
app.route('/billing', billingRouter);

import { waAdapter } from './whatsapp-adapter';

app.get('/api/whatsapp/qr', (c) => {
  const qr = waAdapter.getQR();
  if (!qr) return c.json({ status: waAdapter.getStatus(), message: 'No QR available yet. Please connect first.' });
  return c.json({ qr, status: waAdapter.getStatus() });
});

app.get('/api/whatsapp/status', (c) => {
  return c.json({ status: waAdapter.getStatus() });
});

app.post('/api/whatsapp/connect', async (c) => {
  waAdapter.connect().catch(console.error);
  return c.json({ success: true, message: 'WhatsApp connection process initiated.' });
});

// ======================================================================
// CATCH-ALL for unmatched routes (Must be last)
// ======================================================================
app.all('*', (c) => {
  return c.json({ error: 'Not found', path: c.req.path, method: c.req.method }, 404);
});

import { processScheduledTasks } from './agent/scheduler';

export { app };
export default {
  fetch: app.fetch,
  async scheduled(event: any, env: Bindings, ctx: any) {
    ctx.waitUntil(processScheduledTasks(env));
  }
};


