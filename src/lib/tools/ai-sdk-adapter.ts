import { z, ZodSchema } from "zod";
import { MCPToolHandler } from "./types";
import { createZodSchemaFromJsonSchema } from "./schema-parser";

export interface ToolDefinition<TParameters extends ZodSchema, TResult> {
  description?: string;
  parameters: TParameters;
  execute?: (args: z.infer<TParameters>, options?: ToolExecuteOptions) => Promise<TResult>;
}

export interface ToolExecuteOptions {
  toolCallId?: string;
  abortSignal?: AbortSignal;
  messages?: any[];
}

export const convertToAISDKTools = async (mcpToolHandler: MCPToolHandler) => {
  const mcpTools = await mcpToolHandler.getAllTools();
  const aiSdkTools: Record<string, ToolDefinition<any, any>> = {};

  for (const tool of mcpTools) {
    aiSdkTools[tool.name] = tool({
      description: tool.description || "",
      parameters: createZodSchemaFromJsonSchema(tool.input_schema),
      execute: async (args: any, options?: ToolExecuteOptions) => {
        return await mcpToolHandler.callTool(tool.name, args);
      },
    });
  }

  return aiSdkTools;
};
