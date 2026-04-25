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

export async function runSketchAgent(params: SketchAgentParams) {
  const { systemPrompt, userMessage, env, userId } = params;
  
  // Map tools to the format expected by the SDK
  const toolDefinitions = Object.entries(sketchTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.parameters, // The SDK supports Zod objects
  }));

  const { query } = await import("@anthropic-ai/claude-agent-sdk");
  
  // Use the high-tier Admin key if available, fallback to standard
  const apiKey = env.ANTHROPIC_ADMIN_KEY || env.ANTHROPIC_API_KEY;
  
  const run = query({
    prompt: userMessage,
    options: {
      systemPrompt: systemPrompt,
      tools: toolDefinitions as any,
      permissionMode: "default",
      apiKey: apiKey,
    }
  });

  let finalText = "";
  let totalTokens = 0;

  for await (const message of run as any) {
    if (message.type === "assistant") {
      const content = message.message?.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === "text") {
            finalText += block.text;
            params.onText?.(block.text);
          } else if (block.type === "tool_use") {
            params.onToolUse?.(block.name, block.input);
            
            // Execute the tool if it exists
            const toolName = block.name as SketchToolName;
            if (sketchTools[toolName]) {
              try {
                const result = await sketchTools[toolName].execute(block.input, env);
                // In a more complex flow, we'd feed the result back to the LLM
                console.log(`[Sketch Runner] Tool ${toolName} executed:`, result);
              } catch (err) {
                console.error(`[Sketch Runner] Tool ${toolName} failed:`, err);
              }
            }
          }
        }
      }
    } else if (message.type === "result") {
      totalTokens = (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0);
    }
  }

  // Increment usage for billing
  await incrementUsage(env.DATABASE_URL, userId, totalTokens);

  return {
    text: finalText,
    tokens: totalTokens
  };
}

