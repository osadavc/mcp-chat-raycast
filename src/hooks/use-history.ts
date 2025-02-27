import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Chat } from "../type";

export const useHistory = () => {
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const storedHistory = await LocalStorage.getItem<string>("history");

      if (storedHistory) {
        setChatHistory((previous) => [...previous, ...JSON.parse(storedHistory)]);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    LocalStorage.setItem("history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const add = useCallback(
    async (chat: Chat) => {
      setChatHistory([...chatHistory, chat]);
    },
    [chatHistory],
  );

  const remove = useCallback(
    async (answer: Chat) => {
      const toast = await showToast({
        title: "Removing answer...",
        style: Toast.Style.Animated,
      });
      const newHistory: Chat[] = chatHistory.filter((item) => item.id !== answer.id);
      setChatHistory(newHistory);
      toast.title = "Answer removed!";
      toast.style = Toast.Style.Success;
    },
    [chatHistory],
  );

  const clear = useCallback(async () => {
    const toast = await showToast({
      title: "Clearing history...",
      style: Toast.Style.Animated,
    });
    setChatHistory([]);
    toast.title = "History cleared!";
    toast.style = Toast.Style.Success;
  }, [chatHistory]);

  return useMemo(() => ({ chatHistory, isLoading, add, remove, clear }), [chatHistory, isLoading, add, remove, clear]);
};
