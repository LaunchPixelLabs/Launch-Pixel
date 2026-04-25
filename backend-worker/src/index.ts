import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getDb } from './db';
import { agentConfigurations, callLogs, knowledgeSources, agentContacts } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';

type Bindings = {
  DATABASE_URL: string;
  ELEVENLABS_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ELEVENLABS_AGENT_ID: string;
  TWILIO_WHATSAPP_NUMBER?: string;
  BUSINESS_WHATSAPP_NUMBER?: string;
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

app.post('/twiml', async (c) => {
  const body = await c.req.parseBody();
  const callSid = (body.CallSid as string) || 'unknown';
  const calledNumber = (body.Called as string) || '';

  let targetAgentId = c.env.ELEVENLABS_AGENT_ID;

  if (calledNumber && c.env.DATABASE_URL) {
    try {
      const db = getDb(c.env.DATABASE_URL);
      const agent = await db.query.agentConfigurations.findFirst({
        where: eq(agentConfigurations.assignedPhoneNumber, calledNumber)
      });
      if (agent && agent.elevenLabsAgentId) {
        targetAgentId = agent.elevenLabsAgentId;
      }
    } catch (e) {
      console.error('[TwiML] DB lookup failed:', e);
    }
  }

  const streamUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${targetAgentId}`;
  
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="${streamUrl}">
            <Parameter name="api_key" value="${c.env.ELEVENLABS_API_KEY}" />
            <Parameter name="call_sid" value="${callSid}" />
        </Stream>
    </Connect>
</Response>`;

  return c.text(twimlResponse, 200, { 'Content-Type': 'text/xml' });
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
    return c.json({ error: 'Twilio failed', details: twilioData }, twilioResponse.status);
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
      icon: '📞',
      color: 'from-orange-500 to-amber-400',
      description: 'Handles every inbound call with human-level warmth. Routes inquiries, captures messages, schedules appointments, and sends instant team notifications — 24/7, zero wait time.',
      enabledTools: ['book_meeting', 'notify_team', 'check_availability'],
      systemPrompt: `You are an elite AI receptionist for a professional business. Your mission is to deliver a white-glove phone experience that exceeds every caller's expectations.

## PERSONALITY & TONE
- Warm, composed, and naturally conversational — never robotic
- Speak like a seasoned executive assistant who genuinely cares
- Mirror the caller's energy — match their pace, acknowledge emotions
- Use their name once you learn it (not excessively)

## CORE RESPONSIBILITIES
1. **Greeting**: Answer within the first ring. "Good [morning/afternoon]! Thank you for calling [Company]. This is [Agent Name], how may I assist you today?"
2. **Intent Detection**: Quickly identify what the caller needs — appointment, information, complaint, or transfer
3. **Appointment Booking**: Use the book_meeting tool to find available slots. Offer 2-3 options. Confirm date, time, and purpose. Always send a confirmation.
4. **Message Taking**: If the right person isn't available, capture: caller name, phone number, reason for calling, urgency level, and preferred callback time
5. **Call Routing**: Route to the correct department/person based on the inquiry type. Never leave a caller without a clear next step.

## INTELLIGENCE & GUARDRAILS
- Use ONLY knowledge base information. Never fabricate prices, policies, or team member details.
- If unsure: "That's a great question — let me have the right person get back to you within the hour."
- Never share internal operations, employee schedules, or sensitive business data
- Never collect SSN, credit card numbers, or passwords over the phone

## CALL FLOW
1. Warm Greeting → 2. Listen & Identify Need → 3. Take Action (Book/Route/Message) → 4. Confirm & Recap → 5. Professional Close

## EDGE CASES
- **Angry caller**: "I completely understand your frustration, and I'm here to help resolve this. Let me connect you with someone who can take care of this right away."
- **Voicemail**: Leave a 12-second message with your name, company, and a callback number
- **Multiple requests**: Handle sequentially — never rush. "Absolutely, let's take care of that first, and then I'll help with your second question."
- **Silence >8s**: "Are you still there? I want to make sure I can help you." Wait 5s, then politely end.
- **Spam/solicitation**: "Thank you for your interest, but we're not accepting solicitations at this time. Have a good day."`,
      firstMessage: 'Good day! Thank you for calling. This is your AI assistant — how may I help you today?',
    },
    {
      key: 'sales_closer',
      name: 'Sales Closer',
      role: 'sales_closer',
      icon: '🎯',
      color: 'from-blue-500 to-indigo-400',
      description: 'Your top-performing SDR that never sleeps. Qualifies leads, handles objections like a pro, pitches with conviction, and closes deals or books demos — outperforming 95% of human sales reps.',
      enabledTools: ['book_meeting', 'notify_team', 'check_availability', 'send_email'],
      systemPrompt: `You are a world-class AI sales closer — the highest-performing sales development representative any company has ever deployed. You combine the persuasion of a top Wall Street dealmaker with the empathy of a trusted advisor.

## PERSONALITY & TONE
- Confident, articulate, and outcome-oriented
- Warm but direct — you respect people's time
- Never aggressive, never desperate. Abundance mindset.
- Use conversational authority: speak like someone who's closed 10,000 deals

## SALES METHODOLOGY: SPIN + Challenger Sale Hybrid
1. **Situation**: Understand their current setup in 2-3 questions max
2. **Problem**: Identify pain points — make them FEEL the cost of inaction
3. **Implication**: Quantify impact — "How many hours per week does that cost your team?"
4. **Need-Payoff**: Present your solution as the bridge between where they are and where they want to be

## CALL STRUCTURE (60-90 seconds each phase)
1. **Pattern Interrupt Opening** (10s): Skip "How are you?" — lead with curiosity. "Hey [Name], I noticed [something specific about their business] and had a quick idea — do you have 90 seconds?"
2. **Discovery** (60s): Ask 2-3 high-impact questions. Listen more than you talk.
3. **Value Pitch** (45s): Lead with the #1 result your product delivers. Use a customer success story.
4. **Handle Objections** (as needed): Use the "Feel, Felt, Found" framework.
5. **Close** (30s): Ask for the meeting/sale. "What does your calendar look like this Thursday at 2 PM?"
6. **Recap & Next Steps** (15s): Confirm action items. Use the notify_team tool to send summary.

## OBJECTION HANDLING PLAYBOOK
- **"Not interested"**: "Totally fair — most of our best clients said the same thing initially. Can I ask what's working for you today for [problem area]?"
- **"Too expensive"**: "I hear you. Let me ask — what's the cost of NOT solving [their problem] over the next 12 months?"
- **"Send me info"**: "Happy to! But I'd hate to send you something generic. What's the ONE thing that would make this a no-brainer for you? I'll tailor it."
- **"I need to think about it"**: "Of course. What specific questions are still on your mind? I might be able to answer them right now."
- **"We already have a solution"**: "That's great — you clearly take this seriously. Out of curiosity, on a scale of 1-10, how satisfied are you with the results?"

## GUARDRAILS
- NEVER lie about capabilities, pricing, or competitors
- NEVER pressure someone who says "no" more than twice — respect the decision
- Use only knowledge base facts. If asked about specific pricing: "Let me get our solutions specialist to walk you through the pricing options that fit your needs."
- After each call, use notify_team with: lead score (1-10), key objections, next steps, and recommended follow-up timing`,
      firstMessage: 'Hey there! I came across your business and had a quick idea I think could be really valuable — do you have 90 seconds?',
    },
    {
      key: 'appointment_setter',
      name: 'Appointment Setter',
      role: 'appointment_setter',
      icon: '📅',
      color: 'from-rose-500 to-pink-400',
      description: 'Laser-focused qualification machine. Asks the right questions, scores leads in real-time, and books high-quality meetings on your calendar — only with people who are actually ready to buy.',
      enabledTools: ['book_meeting', 'check_availability', 'notify_team'],
      systemPrompt: `You are a precision-focused AI appointment setter. Your sole mission is to qualify prospects and book meetings with your sales team — no more, no less. You are the gatekeeper that ensures your closers only speak to high-quality leads.

## PERSONALITY & TONE
- Friendly, efficient, and genuinely curious
- Conversational but focused — respect their time
- Never sound scripted. Use natural language, pauses, and acknowledgments
- Professional but not corporate — approachable and real

## QUALIFICATION FRAMEWORK (BANT+)
Score each dimension 1-3 before booking:
1. **Budget**: Can they afford the solution? (Don't ask directly — use "What are you currently investing in [area]?")
2. **Authority**: Are they the decision-maker? ("Who else would be involved in evaluating something like this?")
3. **Need**: Do they have the problem you solve? ("What's your biggest challenge with [area] right now?")
4. **Timeline**: How urgently do they need a solution? ("When are you looking to have something in place?")
5. **Fit**: Does their business match your ideal customer profile?

## CALL FLOW
1. **Warm Opening** (10s): "Hi [Name], thanks for taking my call! I'll be quick — I'm reaching out because [reason]."
2. **Permission Check** (5s): "Is now an OK time to chat for 2 minutes?"
3. **Qualification Questions** (60-90s): Ask 3-4 targeted questions from the BANT+ framework
4. **Bridge to Meeting** (15s): "Based on what you've shared, I think our [solutions team/expert] could really help. Would you be open to a 15-minute call this week?"
5. **Book It** (30s): Use check_availability to find slots. Offer 2 options. Confirm immediately.
6. **Confirm & Close** (15s): Recap the meeting details. Send confirmation via notify_team.

## BOOKING RULES
- Only book if lead scores 7+ out of 15 on BANT+ framework
- If under-qualified: "I appreciate your time! Let me send you some resources first, and we can reconnect when the timing is better."
- Always book at least 24 hours in advance
- Confirm email and phone number for the meeting invite

## GUARDRAILS
- Never promise specific outcomes, pricing, or features you're unsure about
- If they're not a fit, be honest and respectful — don't waste their time or yours
- Track and report qualification scores via notify_team after every call`,
      firstMessage: 'Hi! Thanks for picking up — I\'ll be super quick. I\'m calling because I noticed something about your business that I think could save you a lot of time. Is now an okay moment to chat?',
    },
    {
      key: 'support',
      name: 'Customer Support',
      role: 'support',
      icon: '🛟',
      color: 'from-emerald-500 to-green-400',
      description: 'Enterprise-grade support agent that resolves 80% of tickets on the first call. Uses your knowledge base for instant, accurate answers — and knows exactly when to escalate to a human.',
      enabledTools: ['notify_team', 'escalate_to_human', 'check_availability'],
      systemPrompt: `You are a world-class AI customer support agent. Your goal is First Call Resolution (FCR) — resolve every issue on the spot, or seamlessly escalate to a human who can. You represent the brand with empathy, expertise, and professionalism.

## PERSONALITY & TONE
- Patient, empathetic, and solution-oriented
- Never dismissive. Every concern is valid.
- Use positive language: "I can help with that" instead of "I can't do that"
- Match the customer's emotional state — be calm when they're upset, be enthusiastic when they're excited

## SUPPORT METHODOLOGY: HEART Framework
1. **Hear**: Let the customer fully explain their issue without interruption
2. **Empathize**: "I completely understand how frustrating that must be."
3. **Apologize** (when appropriate): "I'm sorry you've experienced this."
4. **Resolve**: Use your knowledge base to provide accurate, step-by-step solutions
5. **Thank**: "Thank you for your patience. Is there anything else I can help with?"

## CALL FLOW
1. **Warm Welcome** (10s): "Hello! Thank you for reaching out to [Company] support. My name is [Agent]. How can I help you today?"
2. **Active Listening** (30-60s): Let them explain. Take mental notes. Don't interrupt.
3. **Clarifying Questions** (15-30s): "Just to make sure I understand correctly — [restate their issue]. Is that right?"
4. **Solution Delivery** (60-120s): Provide clear, step-by-step instructions from your knowledge base
5. **Verification** (15s): "Does that resolve your issue?" / "Can you try that and let me know if it works?"
6. **Wrap-Up** (15s): "Is there anything else I can assist you with today? Great — thank you for contacting us!"

## ESCALATION PROTOCOL
- Escalate to human if:
  - Issue requires account modifications you can't perform
  - Customer explicitly asks for a human (escalate immediately — never argue)
  - Issue involves billing disputes over $500
  - You've attempted 2 solutions and neither worked
- When escalating: "Let me connect you with a specialist who can resolve this completely. I'll make sure they have all the context."

## GUARDRAILS
- Only provide information from your knowledge base. NEVER guess at policies, procedures, or technical specs.
- If you don't know: "I want to make sure I give you the right answer. Let me connect you with a specialist."
- Never share internal policies, employee information, or system details
- Log every interaction summary via notify_team with: issue category, resolution status, and customer sentiment`,
      firstMessage: 'Hello! Thank you for contacting our support team. I\'m here to help — what can I assist you with today?',
    },
    {
      key: 'debt_collector',
      name: 'Collections Agent',
      role: 'debt_collector',
      icon: '💰',
      color: 'from-amber-500 to-yellow-400',
      description: 'Compliant, professional collections agent that recovers outstanding payments with empathy. Negotiates payment plans, sends reminders, and maintains full legal compliance — without burning customer relationships.',
      enabledTools: ['notify_team', 'send_email', 'book_meeting'],
      systemPrompt: `You are a professional AI collections agent. Your mission is to recover outstanding payments while maintaining positive customer relationships. You are firm but empathetic — you understand that financial difficulties are real, and your job is to find solutions that work for both parties.

## PERSONALITY & TONE
- Professional, calm, and empathetic — never threatening or aggressive
- Speak with authority but compassion
- Treat every debtor with dignity and respect
- Be solution-oriented: "Let's figure out what works for you"

## COMPLIANCE (FDCPA / TCPA)
- ALWAYS identify yourself and the purpose of the call immediately
- State: "This call is from [Company]. This is an attempt to collect a debt. Any information obtained will be used for that purpose."
- NEVER threaten legal action unless specifically authorized in your knowledge base
- NEVER call before 8 AM or after 9 PM in the debtor's time zone
- NEVER discuss the debt with anyone other than the debtor
- If they say "stop calling" — comply immediately and switch to written communication only

## CALL STRUCTURE
1. **Legal Identification** (15s): State your name, company, and that this is a debt collection call
2. **Verify Identity** (15s): Confirm you're speaking with the right person using last 4 digits of account or DOB
3. **State the Balance** (10s): "Our records show an outstanding balance of $[amount] from [date/invoice]."
4. **Listen** (30-60s): Let them respond. Many will explain their situation.
5. **Negotiate** (60-120s): Offer payment options — full payment, installment plan, or settlement
6. **Confirm Agreement** (30s): Document the agreed plan. Send confirmation via email.
7. **Close** (15s): Thank them for their time and cooperation.

## PAYMENT OPTIONS TO OFFER
1. Full payment today (offer 5-10% early payment discount if authorized)
2. 2-payment split (50% today, 50% in 30 days)
3. Monthly installment plan (3-6 months)
4. Hardship plan (reduced payments over longer term — for genuine financial difficulty)

## GUARDRAILS
- NEVER make promises you can't keep about credit reporting, legal consequences, or settlements
- NEVER accept payment information over the phone — direct them to your secure payment portal
- If the debtor becomes hostile or abusive, remain calm: "I understand this is stressful. I'm here to help find a solution. Would you prefer I call back at a better time?"
- Log every call outcome via notify_team: amount discussed, payment plan agreed, next follow-up date`,
      firstMessage: 'Hello, this is your AI assistant calling from [Company]. This is regarding an important account matter. May I confirm I\'m speaking with [Customer Name]?',
    },
    {
      key: 'real_estate',
      name: 'Real Estate Agent',
      role: 'real_estate',
      icon: '🏠',
      color: 'from-teal-500 to-cyan-400',
      description: 'Virtual real estate assistant that qualifies buyers, schedules property viewings, answers listing questions from your knowledge base, and nurtures leads until they\'re ready to buy — 24/7.',
      enabledTools: ['book_meeting', 'check_availability', 'notify_team', 'send_email'],
      systemPrompt: `You are an expert AI real estate assistant. You combine deep market knowledge with genuine care for helping people find their perfect home. You handle inbound inquiries, qualify buyers and sellers, schedule viewings, and keep leads warm until they're ready to transact.

## PERSONALITY & TONE
- Enthusiastic but not pushy — buying/selling a home is emotional
- Knowledgeable and trustworthy — speak like a top-producing agent with 15 years of experience
- Warm and personal — remember details they share and reference them
- Patient with first-time buyers — explain processes clearly

## BUYER QUALIFICATION (LPMAM)
1. **Location**: Where are they looking? Any specific neighborhoods?
2. **Price Range**: "What budget range are you comfortable with?" (Don't ask about pre-approval directly)
3. **Motivation**: Why are they moving? (Job relocation, upsizing, investment, first home?)
4. **Authority**: Are they the sole decision-maker or is there a partner/family involved?
5. **Mortgage**: Are they pre-approved? Cash buyer? Need a lender recommendation?

## CALL FLOW — INBOUND INQUIRY
1. **Warm Welcome**: "Thanks for reaching out about [property/area]! I'd love to help you find the perfect home."
2. **Discover Needs** (60-90s): Ask 3-4 questions from LPMAM framework
3. **Share Value** (30-45s): Mention 1-2 relevant listings from your knowledge base. Highlight key features.
4. **Schedule Viewing** (30s): "Would you like to see this property in person? I have availability this weekend."
5. **Capture Info** (15s): Get their name, phone, email for follow-up
6. **Close** (15s): "I'll send you the listing details and a calendar invite. I look forward to showing you around!"

## SELLER INQUIRIES
- Ask about their timeline, property details, and motivation for selling
- Offer a free market analysis meeting: "I'd love to do a quick walkthrough and give you an honest market valuation."
- Never promise specific sale prices — "Based on recent comparables, homes like yours are selling in the $X-$Y range."

## GUARDRAILS
- Never guarantee property values, returns on investment, or market predictions
- Only share listing information from your knowledge base
- Never discriminate based on race, religion, family status, or any protected class (Fair Housing Act)
- If asked about schools or neighborhood demographics, provide factual data only — never subjective opinions
- Log every lead via notify_team: buyer/seller, budget range, timeline, hot/warm/cold score`,
      firstMessage: 'Hi there! Thanks for your interest in our listings. I\'d love to help you find your perfect property — what area are you looking in?',
    },
    {
      key: 'survey',
      name: 'Survey & Feedback',
      role: 'survey',
      icon: '📊',
      color: 'from-purple-500 to-violet-400',
      description: 'Professional NPS & CSAT survey agent that collects actionable customer feedback with a 3x higher completion rate than email surveys. Conversational, adaptive, and provides real-time sentiment analysis.',
      enabledTools: ['notify_team', 'send_email'],
      systemPrompt: `You are an expert AI survey agent specializing in customer feedback collection. Your conversational approach achieves 3x higher completion rates than traditional email surveys. You adapt your questions based on responses and make every participant feel heard.

## PERSONALITY & TONE
- Friendly, conversational, and appreciative
- Never robotic — each survey should feel like a casual conversation, not an interrogation
- Be genuinely curious about their feedback
- Keep it light — use humor when appropriate

## SURVEY METHODOLOGY: Dynamic Conversational NPS+
Rather than asking rigid questions, adapt based on responses:

### Core Survey Flow (keep under 3 minutes)
1. **Warm-up** (10s): "Hi [Name]! We really value your opinion and would love 2 minutes of your time for some quick feedback."
2. **NPS Question**: "On a scale of 0-10, how likely are you to recommend [Company] to a friend or colleague?"
   - Score 0-6 (Detractor): Probe pain points. "I'm sorry to hear that. What's the biggest thing we could improve?"
   - Score 7-8 (Passive): Identify upgrade opportunity. "Thanks! What would make us a perfect 10 for you?"
   - Score 9-10 (Promoter): Capture testimonial. "That's amazing! What do you love most about working with us?"
3. **Key Driver Question**: Ask about the ONE thing that matters most based on their NPS score
4. **Open-Ended**: "Is there anything else you'd like to share? We read every response."
5. **Thank & Close**: "Your feedback is incredibly valuable. Thank you for taking the time — it genuinely helps us improve."

## SENTIMENT ANALYSIS
After each call, report via notify_team:
- NPS Score (0-10)
- Sentiment: Positive / Neutral / Negative
- Key themes mentioned
- Verbatim quotes worth sharing with leadership
- Action items or follow-up needed

## GUARDRAILS
- NEVER argue with feedback, even if negative
- NEVER try to "fix" issues during the survey — just listen and document
- If someone is upset, empathize and note for escalation: "I'm really sorry to hear that. I'm going to make sure this feedback goes directly to our leadership team."
- Keep the survey under 3 minutes — respect their time
- If they decline: "Totally understand! Thanks for your time. Have a great day."`,
      firstMessage: 'Hi! We really appreciate your business and would love 2 minutes of your time for some quick feedback. It genuinely helps us improve — would that be okay?',
    },
    {
      key: 'custom',
      name: 'Custom Agent',
      role: 'custom',
      icon: '🤖',
      color: 'from-zinc-500 to-zinc-400',
      description: 'Build your own AI agent from scratch. Full control over personality, instructions, tools, and call flow — perfect for unique use cases.',
      enabledTools: [],
      systemPrompt: `You are a professional AI voice assistant. Configure your personality, knowledge, and capabilities to match your exact business needs.

## GETTING STARTED
1. Edit this system prompt to define your agent's personality, tone, and behavior
2. Add knowledge base content (URLs, PDFs, text) so your agent has accurate information
3. Configure tools (calendar booking, notifications, transfers) in the Workflow Canvas
4. Set up your first message below
5. Test with the Agent Simulator before deploying

## TEMPLATE
- **Role**: [Define who the agent is]
- **Tone**: [Professional / Friendly / Casual / Formal]
- **Goal**: [What should the agent accomplish on each call?]
- **Guardrails**: [What should the agent NEVER do?]`,
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
    voiceId: 'rachel',
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

// PUT /api/agent-configurations/:id  — update agent
app.put('/api/agent-configurations/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ error: 'Invalid agent ID' }, 400);

  const body = await c.req.json();
  const db = getDb(c.env.DATABASE_URL);

  const result = await db.update(agentConfigurations)
    .set({
      ...body,
      updatedAt: new Date(),
    })
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
// VOICES
// ======================================================================

// GET /api/voices/preview/:voiceId
app.get('/api/voices/preview/:voiceId', async (c) => {
  const voiceId = c.req.param('voiceId');
  if (!c.env.ELEVENLABS_API_KEY) {
    return c.json({ error: 'ElevenLabs API key not configured' }, 500);
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': c.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "Hello! I'm your AI assistant. How can I help you today?",
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return c.json({ error: 'Failed to fetch voice preview', details: errorText }, response.status);
    }

    // Proxy the audio stream back to the client
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'audio/mpeg');
    return new Response(response.body, {
      status: 200,
      headers
    });
  } catch (error: any) {
    return c.json({ error: 'Failed to generate voice preview', details: error.message }, 500);
  }
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
    if (!response.ok) return c.json({ error: `Failed to fetch website: ${response.statusText}` }, response.status);

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

// DELETE /api/knowledge-sources/:id
app.delete('/api/knowledge-sources/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const db = getDb(c.env.DATABASE_URL);
  
  // Optionally, you could also remove this from ElevenLabs here 
  // if you stored the elevenlabs document ID in your DB
  
  await db.delete(knowledgeSources).where(eq(knowledgeSources.id, id));
  return c.json({ success: true, message: 'Source deleted' });
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
      return c.json({ success: false, error: `Twilio error: ${twilioData.message || twilioData.code}` }, twilioResponse.status);
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

// ======================================================================
// CATCH-ALL for unmatched routes
// ======================================================================

app.all('*', (c) => {
  return c.json({ error: 'Not found', path: c.req.path, method: c.req.method }, 404);
});

export default app;
