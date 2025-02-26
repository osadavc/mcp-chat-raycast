import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  requires_confirmation?: string[];
}

export interface MCPServersConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export interface MCPConnection {
  client: Client;
  transport: StdioClientTransport;
  serverId: string;
  config: MCPServerConfig;
}

export interface MCPManagerOptions {
  configPath?: string;
  clientInfo?: {
    name: string;
    version: string;
  };
}

export interface MCPToolHandler {
  getAllTools: () => Promise<any[]>;
  callTool: (toolName: string, args: any) => Promise<any>;
  close: () => Promise<void>;
}
