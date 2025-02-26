import { MCPManagerOptions, MCPToolHandler } from "./types.js";
import { initMCPManager, closeMCPConnections } from "./server-connection.js";
import { getAllMCPTools, callMCPTool, callToolAcrossServers, createToolMap } from "./tool-operations.js";

const createMCPToolHandler = (connections: Record<string, any>): MCPToolHandler => {
  let toolMap: Record<string, string> | null = null;

  const initializeToolMap = async (): Promise<Record<string, string>> => {
    if (toolMap === null) {
      const allTools = await getAllMCPTools(connections);
      toolMap = createToolMap(allTools);
    }
    return toolMap;
  };

  return {
    getAllTools: async (): Promise<any[]> => {
      const allTools = await getAllMCPTools(connections);
      await initializeToolMap();
      return Object.values(allTools).flat();
    },

    callTool: async (toolName: string, args: any): Promise<any> => {
      await initializeToolMap();

      if (!toolMap || !toolMap[toolName]) {
        return callToolAcrossServers(connections, toolName, args);
      }

      const serverId = toolMap[toolName];
      if (!serverId || !connections[serverId]) {
        throw new Error(`No server found for tool ${toolName}`);
      }

      return callMCPTool(connections[serverId], toolName, args);
    },

    close: async (): Promise<void> => {
      await closeMCPConnections(connections);
    },
  };
};

export const createMCPManager = async (options: MCPManagerOptions = {}): Promise<MCPToolHandler> => {
  const connections = await initMCPManager(options);
  return createMCPToolHandler(connections);
};

export * from "./types.js";
