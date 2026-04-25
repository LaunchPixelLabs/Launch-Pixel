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
 * Build Anthropic-compatible tool definitions from our Zod-based sketchTools.
 */
function getAnthropicTools(): Array<{ name: string; description: string; input_schema: Record<string, any> }> {
  return Object.entries(sketchTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    input_schema: zodToJsonSchema(tool.parameters),
  }));
}

const SUPERINTELLIGENCE_PROTOCOL = `
[SUPERINTELLIGENCE PROTOCOL ACTIVE]
1. HIGH EQ: Detect user emotion, humor, and tone. Respond with professional warmth.
2. PROACTIVE: Use tools immediately if they solve intent.
3. DYNAMIC MATRIX: You have direct control over the user's dashboard via manage_matrix_data. If a conversation results in a lead being qualified, a task being finished, or a contact detail being learned, update the matrix IMMEDIATELY.
4. SYNAPTIC REASONING: Reason about goals before outputting text.
5. SALES MASTERY: Always guide toward a positive outcome (Meeting Booked, Problem Resolved).
`;

// Cache the tool definitions to avoid redundant schema conversion
let cachedAnthropicTools: any[] | null = null;
function getAnthropicToolsCached() {
  if (!cachedAnthropicTools) {
    cachedAnthropicTools = getAnthropicTools();
  }
  return cachedAnthropicTools;
}

/**
 * Autonomous Neural Runner (V4.2 - Enterprise Context Protocol)
 * Hardened for commercial scale with robust error handling and iterative turn safety.
 */
export async function runSketchAgent(params: SketchAgentParams): Promise<SketchAgentResult> {
  const {
    systemPrompt, userMessage, history = [], env, userId,
    steeringInstructions, canvasState, adminWhatsAppNumber,
  } = params;

  const apiKey = env.ANTHROPIC_ADMIN_KEY || env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No Anthropic API key configured.");

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const anthropic = new Anthropic({ apiKey });

  const tools = getAnthropicToolsCached();
  const toolCallResults: Array<{ name: string; input: any; result: any }> = [];

  // Build Stable System Prompt (Optimized for Cache)
  const fullSystem = `${systemPrompt}\n\n${SUPERINTELLIGENCE_PROTOCOL}\n\n[PLATFORM_RULES]\n- Use *bold* for emphasis.\n- Use monospace for technical data.\n- Do NOT use markdown tables; use bulleted lists.\n- Keep responses mobile-first and scannable.`;

  // Build Neural Context (Proper & Robust Injection)
  const now = new Date();
  const contextParts = [
    `<time>${now.toISOString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})</time>`,
    `<workspace>neural_sector_01</workspace>`,
  ];
  if (steeringInstructions) contextParts.push(`<steering>\n${steeringInstructions}\n</steering>`);
  if (canvasState) contextParts.push(`<workflow>\n${JSON.stringify(canvasState)}\n</workflow>`);
  if (adminWhatsAppNumber) contextParts.push(`<admin_uplink>${adminWhatsAppNumber}</admin_uplink>`);

  const neuralContext = `<neural_context>\n${contextParts.join("\n")}\n</neural_context>`;
  const contextualizedUserMessage = `${neuralContext}\n\n${userMessage}`;

  const messages: any[] = [
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

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4096,
        system: fullSystem,
        tools: tools as any,
        messages: messages as any,
      });

      totalInputTokens += response.usage?.input_tokens || 0;
      totalOutputTokens += response.usage?.output_tokens || 0;
      stopReason = response.stop_reason;

      const textBlocks = response.content.filter((b: any) => b.type === "text");
      const toolUseBlocks = response.content.filter((b: any) => b.type === "tool_use") as any[];

      const assistantText = textBlocks.map((b: any) => b.text).join("\n");
      if (assistantText) {
        finalText += (finalText ? "\n" : "") + assistantText;
        params.onText?.(assistantText);
      }

      for (const block of toolUseBlocks) {
        params.onToolUse?.(block.name, block.input);
      }

      if (toolUseBlocks.length === 0 || response.stop_reason === "end_turn") {
        break;
      }

      messages.push({ role: "assistant", content: response.content as any });

      // Parallel Execution (Peak Performance)
      const toolResults = await Promise.all(toolUseBlocks.map(async (toolBlock) => {
        const toolName = toolBlock.name as SketchToolName;
        let result: any;
        try {
          if (sketchTools[toolName]) {
            const toolEnv = adminWhatsAppNumber ? { ...env, ADMIN_WHATSAPP_NUMBER: adminWhatsAppNumber } : env;
            result = await sketchTools[toolName].execute(toolBlock.input, toolEnv);
          } else {
            result = { error: `Neural link failed: Tool ${toolName} not found` };
          }
        } catch (err: any) {
          result = { error: `Tool execution faulted: ${err.message}` };
        }

        toolCallResults.push({ name: toolBlock.name, input: toolBlock.input, result });
        return {
          type: "tool_result" as const,
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result),
        };
      }));

      messages.push({ role: "user", content: toolResults });
    }
  } catch (error: any) {
    console.error("[NeuralRunner] Critical Fault:", error);
    finalText = `[CRITICAL FAULT] Neural matrix destabilized: ${error.message}`;
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
