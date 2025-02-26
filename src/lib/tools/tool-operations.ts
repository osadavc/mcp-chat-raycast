import { ListToolsResultSchema, CallToolResultSchema } from "@modelcontextprotocol/sdk/types";
import { MCPConnection } from "./types";

export const getAllMCPTools = async (connections: Record<string, MCPConnection>): Promise<Record<string, any[]>> => {
  const allTools: Record<string, any[]> = {};

  for (const [serverId, connection] of Object.entries(connections)) {
    try {
      const toolsResults = await connection.client.request({ method: "tools/list" }, ListToolsResultSchema);

      allTools[serverId] = toolsResults.tools.map(({ inputSchema, ...tool }) => ({
        ...tool,
        input_schema: inputSchema,
        server: serverId,
      }));
    } catch (error) {
      console.error(`Failed to get tools from server ${serverId}:`, error);
      allTools[serverId] = [];
    }
  }

  return allTools;
};

export const callMCPTool = async (connection: MCPConnection, toolName: string, args: any): Promise<any> => {
  try {
    const result = await connection.client.request(
      {
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      },
      CallToolResultSchema,
    );

    return result;
  } catch (error) {
    console.error(`Failed to call tool ${toolName} on server ${connection.serverId}:`, error);
    throw new Error(`Failed to call tool ${toolName}: ${error}`);
  }
};

export const callToolAcrossServers = async (
  connections: Record<string, MCPConnection>,
  toolName: string,
  args: any,
): Promise<any> => {
  for (const [serverId, connection] of Object.entries(connections)) {
    try {
      const result = await callMCPTool(connection, toolName, args);
      return result;
    } catch (error) {
      console.error(`Failed to call tool ${toolName} on server ${serverId}:`, error);
    }
  }

  throw new Error(`No server was able to handle tool ${toolName}`);
};

export const createToolMap = (allTools: Record<string, any[]>): Record<string, string> => {
  const toolMap: Record<string, string> = {};

  for (const [serverId, tools] of Object.entries(allTools)) {
    for (const tool of tools) {
      toolMap[tool.name] = serverId;
    }
  }

  return toolMap;
};
