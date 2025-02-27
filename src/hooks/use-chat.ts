import { getPreferenceValues, clearSearchBar, showToast, Toast } from "@raycast/api";
import { useCallback, useMemo, useState } from "react";
import { Chat } from "../type";
import crypto from "crypto";
import { streamText } from "ai";
import { openai } from "../lib/ai";
import { useHistory } from "./use-history";

export const useChat = <T extends Chat>(props: T[]) => {
  const [data, setData] = useState<Chat[]>(props);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [streamData, setStreamData] = useState<Chat | undefined>();

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
    };

    setData((prev) => {
      return [...prev, chat];
    });

    const { textStream } = streamText({
      model: openai({ apiKey, baseURL })(model),
      messages: [...chatTransformer(data), { role: "user", content: question }],
    });

    try {
      for await (const textPart of textStream) {
        chat.answer += textPart;
        setStreamData({ ...chat, answer: chat.answer });
      }

      setData((prev) => {
        return prev.map((a) => {
          if (a.id === chat.id) {
            return { ...chat, answer: chat.answer };
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
    () => ({ data, setData, isLoading, setLoading, selectedChatId, setSelectedChatId, ask, clear, streamData }),
    [data, setData, isLoading, setLoading, selectedChatId, setSelectedChatId, ask, clear, streamData],
  );
};

export type ChatHook = ReturnType<typeof useChat>;
