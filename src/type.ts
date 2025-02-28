export interface Question {
  id: string;
  question: string;
  created_at: string;
}

export interface ToolCall {
  toolName: string;
  toolCallId: string;
  args: Record<string, any>;
  status?: "in-progress" | "completed" | "failed";
}

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: any;
}

export interface Chat extends Question {
  answer: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface Conversation {
  id: string;
  chats: Chat[];
  updated_at: string;
  created_at: string;
  pinned: boolean;
}
