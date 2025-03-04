import { MCPToolHandler } from "./types";
import { JSONSchemaToZod } from "@dmitryrechkin/json-schema-to-zod";
import { Tool, tool, ToolExecutionOptions } from "ai";

export interface ToolExecuteOptions {
  toolCallId?: string;
  abortSignal?: AbortSignal;
  messages?: any[];
}

export const convertToAISDKTools = async (mcpToolHandler: MCPToolHandler) => {
  const mcpTools = await mcpToolHandler.getAllTools();
  const aiSdkTools: Record<
    string,
    Tool<any, unknown> & {
      execute: (args: any, options: ToolExecutionOptions) => PromiseLike<unknown>;
    }
  > = {};

  for (const mcpTool of mcpTools) {
    aiSdkTools[mcpTool.name] = tool({
      description: mcpTool.description || "",
      parameters: JSONSchemaToZod.convert(mcpTool.input_schema),
      execute: async (args: any, options?: ToolExecuteOptions) => {
        return await mcpToolHandler.callTool(mcpTool.name, args);
      },
    });
  }

  return aiSdkTools;
};
