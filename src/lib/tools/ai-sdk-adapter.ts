import { MCPToolHandler } from "./types";
import { createZodSchemaFromJsonSchema } from "./schema-parser";
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
      parameters: createZodSchemaFromJsonSchema(mcpTool.input_schema),
      execute: async (args: any, options?: ToolExecuteOptions) => {
        return await mcpToolHandler.callTool(mcpTool.name, args);
      },
    });
  }

  return aiSdkTools;
};
