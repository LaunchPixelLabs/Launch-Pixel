import { Bindings } from "../index";

/**
 * MCP Bridge — LaunchPixel x Sketch
 * 
 * This bridge allows the agent to connect to external Model Context Protocol (MCP) servers.
 * It translates Sketch-style tool calls into MCP requests.
 */

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
}

export class MCPBridge {
  private env: Bindings;

  constructor(env: Bindings) {
    this.env = env;
  }

  /**
   * List all available tools from a registered MCP server.
   */
  async listTools(serverUrl: string): Promise<MCPToolDefinition[]> {
    try {
      const response = await fetch(`${serverUrl}/list-tools`, {
        headers: { 'X-API-Key': this.env.ANTHROPIC_ADMIN_KEY || '' }
      });
      const data = await response.json() as any;
      return data.tools || [];
    } catch (e) {
      console.error(`[MCP Bridge] Failed to list tools from ${serverUrl}`, e);
      return [];
    }
  }

  /**
   * Execute a tool on an MCP server.
   */
  async executeTool(serverUrl: string, toolName: string, args: any): Promise<any> {
    console.log(`[MCP Bridge] Executing ${toolName} on ${serverUrl}`, args);
    try {
      const response = await fetch(`${serverUrl}/execute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': this.env.ANTHROPIC_ADMIN_KEY || ''
        },
        body: JSON.stringify({ tool: toolName, arguments: args })
      });
      return await response.json();
    } catch (e) {
      console.error(`[MCP Bridge] Tool execution failed`, e);
      return { error: `Failed to execute ${toolName}` };
    }
  }
}
