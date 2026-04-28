import { Bindings } from "../index";
import { incrementUsage } from "../billing/usage";
import { sketchTools, SketchToolName } from "./sketch-tools";

export interface SketchAgentParams {
  userId: string;
  systemPrompt: string;
  userMessage: string;
  history?: any[];
  env: Bindings;
  onText?: (text: string) => void;
  onToolUse?: (name: string, input: any) => void;
  steeringInstructions?: string;
  canvasState?: any;
  adminWhatsAppNumber?: string;
  contactContext?: string;
  agentId?: number | string;
}

export interface SketchAgentResult {
  text: string;
  tokens: number;
  iterations: number;
  sentiment: string;
  toolCalls: Array<{ name: string; input: any; result: any }>;
}

/**
 * Converts a Zod schema to JSON Schema format for Anthropic's tool definitions.
 */
function zodToJsonSchema(zodSchema: any): Record<string, any> {
  if (!zodSchema?._def) return { type: "object", properties: {} };

  const typeName = zodSchema._def.typeName;

  if (typeName === "ZodObject") {
    const shape = zodSchema._def.shape?.();
    if (!shape) return { type: "object", properties: {} };
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const [key, val] of Object.entries(shape) as any[]) {
      let inner = val;
      let isOptional = false;
      // Unwrap ZodOptional / ZodDefault
      if (inner?._def?.typeName === "ZodOptional" || inner?._def?.typeName === "ZodDefault") {
        isOptional = true;
        inner = inner._def.innerType || inner._def.type;
      }
      properties[key] = zodToJsonSchema(inner);
      if (inner?._def?.description) properties[key].description = inner._def.description;
      if (val?._def?.description) properties[key].description = val._def.description;
      if (!isOptional) required.push(key);
    }
    return { type: "object", properties, ...(required.length > 0 ? { required } : {}) };
  }
  if (typeName === "ZodString") return { type: "string" };
  if (typeName === "ZodNumber") return { type: "number" };
  if (typeName === "ZodBoolean") return { type: "boolean" };
  if (typeName === "ZodEnum") return { type: "string", enum: zodSchema._def.values };
  if (typeName === "ZodArray") {
    return { type: "array", items: zodToJsonSchema(zodSchema._def.type) };
  }
  if (typeName === "ZodRecord") return { type: "object", additionalProperties: true };

  return { type: "string" };
}

/**
 * Build OpenAI-compatible tool definitions from our Zod-based sketchTools.
 */
function getOpenAITools(): Array<{ type: "function"; function: { name: string; description: string; parameters: Record<string, any> } }> {
  return Object.entries(sketchTools).map(([name, tool]) => ({
    type: "function",
    function: {
      name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters),
    }
  }));
}

const STRATEGIC_PROTOCOL = `
[OPERATING PRINCIPLES]
1. MEMORY FIRST: Before responding, recall what you know about this person. Reference past conversations naturally.
2. OBJECTIVE DRIVEN: Every call has a goal. Know it. Work toward it. Don't wander.
3. HUMAN LOOP: For anything involving money, deadlines, or custom terms — get owner approval. Never promise what you can't deliver.
4. BIG PICTURE: You're not just handling one call. You're managing a pipeline. Prioritize high-value leads. Flag stale deals.
5. CLOSE OR ADVANCE: Every interaction must either close the deal or move it forward one step. Never leave a call without a next action.
6. EXTRACT & STORE: After every interaction, save what you learned (preferences, objections, commitments) using memory tools.
7. FOLLOW UP: If you promise to call back, schedule it. If they promise to decide by Friday, schedule a check-in for Monday.
`;

// Cache the tool definitions to avoid redundant schema conversion
let cachedOpenAITools: any[] | null = null;
function getOpenAIToolsCached() {
  if (!cachedOpenAITools) {
    cachedOpenAITools = getOpenAITools();
  }
  return cachedOpenAITools;
}

/**
 * Autonomous Agent Runner
 * Hardened for commercial scale with robust error handling and iterative turn safety.
 */
export async function runSketchAgent(params: SketchAgentParams): Promise<SketchAgentResult> {
  const {
    systemPrompt, userMessage, history = [], env, userId,
    steeringInstructions, canvasState, adminWhatsAppNumber, contactContext, agentId
  } = params;

  // Use NVIDIA OpenAI compatible endpoint for Llama testing
  const apiKey = "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"; 

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ 
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1"
  });

  const tools = getOpenAIToolsCached();
  const toolCallResults: Array<{ name: string; input: any; result: any }> = [];

  // Build Stable System Prompt (Optimized for Cache)
  const fullSystem = `${systemPrompt}\n\n${STRATEGIC_PROTOCOL}\n\n[PLATFORM_RULES]\n- Use *bold* for emphasis.\n- Use monospace for technical data.\n- Do NOT use markdown tables; use bulleted lists.\n- Keep responses mobile-first and scannable.`;

function parseWorkflowToRules(canvasState: any): string {
  if (!canvasState?.nodes) return "";
  const rules: string[] = ["[WORKFLOW RULES - YOU MUST FOLLOW THESE STRICTLY]"];
  
  const toolMap: Record<string, string> = {
    'knowledge': 'search_knowledge',
    'schedule': 'book_meeting',
    'transfer': 'transfer_call',
    'whatsapp_admin': 'request_approval' // Maps admin alerts to the approval/notification tool
  };

  canvasState.nodes.forEach((n: any) => {
    if (n.type === 'response') rules.push(`- SCRIPT RESPONSE: You must say exactly or closely resemble: "${n.data.label}"`);
    if (n.type === 'rejection') rules.push(`- OBJECTION HANDLING: If user says something matching "${n.data.trigger}", reply with: "${n.data.response}"`);
    if (n.type === 'keyword') rules.push(`- INTENT DETECTION: Listen for user intents matching: "${n.data.keyword}"`);
    if (n.type === 'action') {
      const actualTool = toolMap[n.data.icon] || n.data.icon;
      rules.push(`- TOOL ACTION: Execute the ${actualTool} tool for the purpose of: "${n.data.title} - ${n.data.description}"`);
    }
  });
  return rules.join("\n");
}

  // Build Context (Proper & Robust Injection)
  const now = new Date();
  const contextParts = [
    `<time>${now.toISOString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})</time>`,
    `<workspace>active_session</workspace>`,
  ];
  if (steeringInstructions) contextParts.push(`<steering>\n${steeringInstructions}\n</steering>`);
  if (canvasState) contextParts.push(`<workflow>\n${parseWorkflowToRules(canvasState)}\n</workflow>`);
  if (adminWhatsAppNumber) contextParts.push(`<admin_uplink>${adminWhatsAppNumber}</admin_uplink>`);
  if (contactContext) contextParts.push(contactContext);

  const activeContext = `<context>\n${contextParts.join("\n")}\n</context>`;
  const contextualizedUserMessage = `${activeContext}\n\n${userMessage}`;

  const messages: any[] = [
    { role: "system", content: fullSystem },
    ...history.map((h: any) => ({ role: h.role, content: h.content })),
    { role: "user", content: contextualizedUserMessage },
  ];

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let finalText = "";
  let iterations = 0;
  const MAX_ITERATIONS = 10; // Robust turn limit
  let stopReason: string | null | undefined = "max_iterations";

  try {
    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await openai.chat.completions.create({
        model: "meta/llama-3.1-70b-instruct",
        max_tokens: 1024,
        messages: messages as any,
        tools: tools.length > 0 ? tools : undefined,
      });

      totalInputTokens += response.usage?.prompt_tokens || 0;
      totalOutputTokens += response.usage?.completion_tokens || 0;
      
      const message = response.choices[0].message;
      stopReason = response.choices[0].finish_reason;

      const assistantText = message.content;
      if (assistantText) {
        finalText += (finalText ? "\n" : "") + assistantText;
        params.onText?.(assistantText);
      }

      const toolCalls = message.tool_calls || [];
      for (const toolCall of toolCalls) {
        if (toolCall.type === "function") {
          try {
            params.onToolUse?.(toolCall.function.name, JSON.parse(toolCall.function.arguments));
          } catch(e) {}
        }
      }

      if (toolCalls.length === 0 || stopReason === "stop") {
        break;
      }

      // Add the assistant's message with tool calls to history
      messages.push(message);

      // Parallel Execution (Peak Performance)
      const toolResults = await Promise.all(toolCalls.map(async (toolCall) => {
        if (toolCall.type !== "function") return null;
        
        const toolName = toolCall.function.name as SketchToolName;
        let input: any = {};
        try {
          input = JSON.parse(toolCall.function.arguments);
        } catch(e) {}
        
        let result: any;
        try {
          if (sketchTools[toolName]) {
            const toolEnv = { 
              ...env, 
              ...(adminWhatsAppNumber ? { ADMIN_WHATSAPP_NUMBER: adminWhatsAppNumber } : {}),
              ...(agentId ? { AGENT_ID: agentId } : {})
            };
            result = await sketchTools[toolName].execute(input, toolEnv);
          } else {
            result = { error: `Unknown tool: ${toolName}` };
          }
        } catch (err: any) {
          result = { error: `Tool execution faulted: ${err.message}` };
        }

        toolCallResults.push({ name: toolName, input, result });
        return {
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(result),
        };
      }));

      // Append valid tool results back to the thread
      messages.push(...toolResults.filter(Boolean));
    }
  } catch (error: any) {
    console.error("[AgentRunner] Critical error:", error);
    finalText = `An internal error occurred: ${error.message}`;
    stopReason = "error";
  }

  // Finalize Sentiment & Billing
  const totalTokens = totalInputTokens + totalOutputTokens;
  if (userId && env.DATABASE_URL) {
    try { await incrementUsage(env.DATABASE_URL, userId, totalTokens); } catch (e) {}
  }

  const lower = finalText.toLowerCase();
  const sentiment = (lower.includes("book") || lower.includes("confirm")) ? "positive" : 
                    (lower.includes("fault") || lower.includes("error")) ? "negative" : "neutral";

  return {
    text: finalText,
    tokens: totalTokens,
    iterations,
    sentiment,
    toolCalls: toolCallResults,
  };
}
