import { Bindings } from "../index";
import { incrementUsage } from "../billing/usage";
import { sketchTools, SketchToolName } from "./sketch-tools";

export interface SketchAgentParams {
  userId: string;
  systemPrompt: string;
  userMessage: string;
  env: Bindings;
  onText?: (text: string) => void;
  onToolUse?: (name: string, input: any) => void;
}

/**
 * Autonomous Neural Runner
 * 
 * Implements a recursive agentic loop that allows Claude to use tools,
 * observe results, and reason toward a final goal.
 */
export async function runSketchAgent(params: SketchAgentParams) {
  const { systemPrompt, userMessage, env, userId } = params;
  const { query } = await import("@anthropic-ai/claude-agent-sdk");
  
  const toolDefinitions = Object.entries(sketchTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.parameters,
  }));

  const apiKey = env.ANTHROPIC_ADMIN_KEY || env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Neural Core: Missing Anthropic API Key");

  // Initial prompt
  let messages: any[] = [{ role: "user", content: userMessage }];
  let finalText = "";
  let totalTokens = 0;
  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const run = query({
      prompt: messages,
      options: {
        systemPrompt: `${systemPrompt}\n\n[PROTOCOL] You are a high-tier autonomous agent powered by Sketch architecture. Use tools decisively. If a tool fails, reason through the error and try an alternative path.`,
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

    if (toolCalls.length === 0) break; // Agent is done

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

  return {
    text: finalText,
    tokens: totalTokens,
    iterations
  };
}

