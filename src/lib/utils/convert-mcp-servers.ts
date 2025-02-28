import { MCPServer } from "../../views/mcp-servers/types";
import { MCPServersConfig } from "../tools/types";

export const convertMCPServersToConfig = (servers: MCPServer[]): MCPServersConfig => {
  const mcpServers: Record<string, any> = {};

  servers.forEach((server) => {
    const commandParts = server.command.split(" ");
    const command = commandParts[0];
    const args = commandParts.slice(1);

    mcpServers[server.id] = {
      command,
      args,
      ...(Object.keys(server.env).length > 0 && { env: server.env }),
    };
  });

  return { mcpServers };
};
