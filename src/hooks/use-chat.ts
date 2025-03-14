import { getPreferenceValues, clearSearchBar, showToast, Toast } from "@raycast/api";
import { useCallback, useMemo, useState } from "react";
import { Chat } from "../type";
import crypto from "crypto";
import { streamText } from "ai";
import { openai } from "../lib/ai";
import { useHistory } from "./use-history";
import { MCPServer } from "../views/mcp-servers/types";
import { useLocalStorage } from "@raycast/utils";
import { convertMCPServersToConfig } from "../lib/utils/convert-mcp-servers";
import { convertToAISDKTools, createMCPManager } from "../lib/tools";

export const useChat = <T extends Chat>(props: T[]) => {
  const [data, setData] = useState<Chat[]>(props);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [streamData, setStreamData] = useState<Chat | undefined>();

  const { value: mcpServers = [], isLoading: isLoadingStorage } = useLocalStorage<MCPServer[]>("mcp-servers", []);

  const [{ apiKey, baseURL, model }] = useState(() => {
    return getPreferenceValues<{
      apiKey: string;
      baseURL: string;
      model: string;
    }>();
  });

  const history = useHistory();
  const chatTransformer = (chatHistory: Chat[]) => {
    return chatHistory.flatMap((chat) => [
      { role: "user" as const, content: chat.question },
      { role: "assistant" as const, content: chat.answer },
    ]);
  };

  const ask = async (question: string) => {
    clearSearchBar();
    setLoading(true);

    const toast = await showToast({
      title: "Getting your answer...",
      style: Toast.Style.Animated,
    });

    let chat: Chat = {
      id: crypto.randomUUID(),
      question,
      answer: "",
      created_at: new Date().toISOString(),
      toolCalls: [],
      toolResults: [],
    };

    setData((prev) => {
      return [...prev, chat];
    });

    const mcpToolHandler = await createMCPManager({
      mcpServers: convertMCPServersToConfig(mcpServers),
      clientInfo: {
        name: "raycast-mcp",
        version: "1.0.0",
      },
    });

    const { textStream } = streamText({
      model: openai({ apiKey, baseURL })(model),
      system: `You are a helpful assistant that can answer questions and help with tasks by using the tools provided. Today's date is ${new Date().toISOString().split("T")[0]}`,
      messages: [...chatTransformer(data), { role: "user", content: question }],
      tools: await convertToAISDKTools(mcpToolHandler),
      toolChoice: "auto",
      toolCallStreaming: true,
      maxSteps: 10,
      onStepFinish: async ({ toolCalls }) => {
        if (toolCalls && toolCalls.length > 0) {
          for (const tc of toolCalls) {
            await showToast({
              title: `Called ${tc.toolName} tool with args: ${JSON.stringify(tc.args)}`,
              style: Toast.Style.Animated,
            });
          }
        }
      },
    });

    try {
      for await (const textPart of textStream) {
        chat.answer += textPart;
        setStreamData({ ...chat });
      }

      setData((prev) => {
        return prev.map((a) => {
          if (a.id === chat.id) {
            return { ...chat };
          }
          return a;
        });
      });

      setLoading(false);
      toast.title = "Got your answer!";
      toast.style = Toast.Style.Success;
    } catch (err) {
      toast.title = "Error";
      toast.message = `Couldn't stream message: ${err}`;
      toast.style = Toast.Style.Failure;
      setLoading(false);
    }

    history.add(chat);
  };

  const clear = useCallback(async () => {
    setData([]);
  }, [setData]);

  return useMemo(
    () => ({
      data,
      setData,
      isLoading: isLoading || isLoadingStorage,
      setLoading,
      selectedChatId,
      setSelectedChatId,
      ask,
      clear,
      streamData,
    }),
    [data, setData, isLoading, setLoading, isLoadingStorage, selectedChatId, setSelectedChatId, ask, clear, streamData],
  );
};

export type ChatHook = ReturnType<typeof useChat>;
