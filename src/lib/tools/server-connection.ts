import { Client } from "@modelcontextprotocol/sdk/client/index";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import fs from "fs/promises";
import path from "path";
import { MCPServerConfig, MCPServersConfig, MCPConnection, MCPManagerOptions } from "./types";

export const loadMCPConfig = async (configPath: string): Promise<MCPServersConfig> => {
  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    return JSON.parse(configContent) as MCPServersConfig;
  } catch (error) {
    console.error(`Failed to load MCP config from ${configPath}:`, error);
    throw new Error(`Failed to load MCP configuration: ${error}`);
  }
};

export const createMCPTransport = (serverConfig: MCPServerConfig): StdioClientTransport => {
  return new StdioClientTransport({
    command: serverConfig.command,
    args: serverConfig.args,
    env: serverConfig.env,
  });
};

export const createMCPClient = (
  clientInfo: { name: string; version: string },
  capabilities = { prompts: {}, resources: {}, tools: {} },
): Client => {
  return new Client(clientInfo, { capabilities });
};

export const connectToMCPServer = async (
  serverId: string,
  serverConfig: MCPServerConfig,
  clientInfo = { name: "mcp-client", version: "1.0.0" },
): Promise<MCPConnection> => {
  const transport = createMCPTransport(serverConfig);
  const client = createMCPClient(clientInfo);

  try {
    await client.connect(transport);
    return {
      client,
      transport,
      serverId,
      config: serverConfig,
    };
  } catch (error) {
    console.error(`Failed to connect to MCP server ${serverId}:`, error);
    throw new Error(`Failed to connect to MCP server ${serverId}: ${error}`);
  }
};

export const connectToAllMCPServers = async (
  config: MCPServersConfig,
  clientInfo = { name: "mcp-client", version: "1.0.0" },
): Promise<Record<string, MCPConnection>> => {
  const connections: Record<string, MCPConnection> = {};

  for (const [serverId, serverConfig] of Object.entries(config.mcpServers)) {
    try {
      connections[serverId] = await connectToMCPServer(serverId, serverConfig, clientInfo);
    } catch (error) {
      console.error(`Failed to connect to server ${serverId}:`, error);
    }
  }

  return connections;
};

export const initMCPManager = async (options: MCPManagerOptions = {}): Promise<Record<string, MCPConnection>> => {
  const {
    configPath = path.join(process.cwd(), "mcp-server-configon"),
    clientInfo = { name: "mcp-client", version: "1.0.0" },
  } = options;

  const config = await loadMCPConfig(configPath);
  return connectToAllMCPServers(config, clientInfo);
};

export const closeMCPConnections = async (connections: Record<string, MCPConnection>): Promise<void> => {
  for (const connection of Object.values(connections)) {
    try {
      await connection.client.close();
    } catch (error) {
      console.error(`Error closing connection to ${connection.serverId}:`, error);
    }
  }
};
