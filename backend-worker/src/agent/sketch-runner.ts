import { Bindings } from "../index";
import { incrementUsage } from "../billing/usage";
import { sketchTools, SketchToolName } from "./sketch-tools";

export interface SketchAgentParams {
  userId: string;
  systemPrompt: string;
  userMessage: string;
  history?: any[]; // Allow passing conversation history
  env: Bindings;
  onText?: (text: string) => void;
  onToolUse?: (name: string, input: any) => void;
}

/**
 * Autonomous Neural Runner (V2 - Superintelligence Upgrade)
 * 
 * Implements a recursive agentic loop with High-EQ reasoning, 
 * proactive tool-use, and sentiment-aware feedback.
 */
export async function runSketchAgent(params: SketchAgentParams) {
  const { systemPrompt, userMessage, history = [], env, userId } = params;
  const { query } = await import("@anthropic-ai/claude-agent-sdk");
  
  const toolDefinitions = Object.entries(sketchTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.parameters,
  }));

  const apiKey = env.ANTHROPIC_ADMIN_KEY || env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Neural Core: Missing Anthropic API Key");

  // Load history and add new message
  let messages: any[] = [...history, { role: "user", content: userMessage }];
  let finalText = "";
  let totalTokens = 0;
  let iterations = 0;
  const MAX_ITERATIONS = 5;

  const SUPERINTELLIGENCE_PROTOCOL = `
[SUPERINTELLIGENCE PROTOCOL ACTIVE]
1. HIGH EQ: Detect user emotion, humor, and tone. Respond with professional warmth. If the user jokes, acknowledge it.
2. PROACTIVE: Don't wait for permission to use tools if they clearly solve the user's intent.
3. SYNAPTIC REASONING: Before outputting text, reason about the "State of the Matrix" and user goals.
4. SALES MASTERY: Always guide the conversation toward a positive outcome (Meeting Booked, Problem Resolved).
`;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const run = query({
      prompt: messages,
      options: {
        systemPrompt: `${systemPrompt}\n\n${SUPERINTELLIGENCE_PROTOCOL}`,
        tools: toolDefinitions as any,
        permissionMode: "default",
        apiKey: apiKey,
      }
    });

    let toolCalls: any[] = [];
    let assistantText = "";

    for await (const message of run as any) {
      if (message.type === "assistant") {
        const content = message.message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === "text") {
              assistantText += block.text;
              params.onText?.(block.text);
            } else if (block.type === "tool_use") {
              toolCalls.push(block);
              params.onToolUse?.(block.name, block.input);
            }
          }
        }
      } else if (message.type === "result") {
        totalTokens += (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0);
      }
    }

    finalText += assistantText;

    if (toolCalls.length === 0) break; 

    // Add assistant message with tool calls to history
    messages.push({
      role: "assistant",
      content: [
        ...(assistantText ? [{ type: "text", text: assistantText }] : []),
        ...toolCalls
      ]
    });

    // Execute tools and collect results
    let toolResults: any[] = [];
    for (const toolCall of toolCalls) {
      const toolName = toolCall.name as SketchToolName;
      if (sketchTools[toolName]) {
        try {
          const result = await sketchTools[toolName].execute(toolCall.input, env);
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolCall.id,
            content: JSON.stringify(result)
          });
        } catch (err: any) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolCall.id,
            content: `Error: ${err.message}`,
            is_error: true
          });
        }
      }
    }

    // Add tool results to history for next iteration
    messages.push({ role: "user", content: toolResults });
  }

  // Final synchronization with billing
  await incrementUsage(env.DATABASE_URL, userId, totalTokens);

  // Brain Pass: Sentiment & Outcome
  let sentiment = "neutral";
  if (finalText.length > 0) {
    const sentimentPass = await query({
      prompt: [{ role: "user", content: `Analyze the following response and return ONLY a single JSON object with 'sentiment' (positive/neutral/negative) and 'success' (true/false if goal achieved): "${finalText}"` }],
      options: { apiKey }
    });
    // Simplified: Just extract basic tone for now to avoid extra delay in real-time
    if (finalText.toLowerCase().includes("great") || finalText.toLowerCase().includes("book") || finalText.toLowerCase().includes("yes")) {
      sentiment = "positive";
    }
  }

  return {
    text: finalText,
    tokens: totalTokens,
    iterations,
    sentiment
  };
}

