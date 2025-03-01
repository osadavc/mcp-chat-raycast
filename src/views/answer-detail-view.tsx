import { List } from "@raycast/api";
import { Chat, ToolCall, ToolResult } from "../type";

const formatToolCall = (toolCall: ToolCall) => {
  const statusIndicator =
    toolCall.status === "in-progress" ? " *(in progress...)* " : toolCall.status === "failed" ? " *(failed)* " : "";

  return `\n\n**Tool Call:** \`${toolCall.toolName}\`${statusIndicator}\n\`\`\`json\n${JSON.stringify(toolCall.args, null, 2)}\n\`\`\``;
};

const formatToolResult = (toolResult: ToolResult) => {
  const formattedResult =
    typeof toolResult.result === "object" ? JSON.stringify(toolResult.result, null, 2) : toolResult.result;

  return `\n\n**Tool Result:** \`${toolResult.toolName}\`\n\`\`\`json\n${formattedResult}\n\`\`\``;
};

const renderToolCallsAndResults = (chat: Chat, isStreaming: boolean) => {
  if (!chat.toolCalls?.length) return "";

  // Only show tool calls and results when not streaming
  if (isStreaming) return "";

  let markdown = "";

  for (const toolCall of chat.toolCalls) {
    markdown += formatToolCall(toolCall);

    const toolResult = chat.toolResults?.find((result) => result.toolCallId === toolCall.toolCallId);
    if (toolResult) {
      markdown += formatToolResult(toolResult);
    }
  }

  return markdown;
};

export const AnswerDetailView = (props: { chat: Chat; streamData?: Chat | undefined }) => {
  const { chat, streamData } = props;
  const isStreaming = Boolean(streamData && streamData.id === chat.id);

  const currentChat = isStreaming ? streamData : chat;
  const toolContent = currentChat ? renderToolCallsAndResults(currentChat, isStreaming) : "";

  const markdown = `${currentChat?.answer || ""}${toolContent}`;

  return <List.Item.Detail markdown={markdown} />;
};
