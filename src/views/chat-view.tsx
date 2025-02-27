import { ActionPanel, List } from "@raycast/api";
import { Chat } from "../type";
import { ChatHook } from "../hooks/use-chat";
import { useMemo } from "react";
import { EmptyView } from "./empty-view";
import { AnswerDetailView } from "./answer-detail-view";
import { PreferencesActionSection } from "../actions/preferences";
import { PrimaryAction } from "../actions";

export const ChatView = ({ chats, use, question }: { chats: Chat[]; use: { chats: ChatHook }; question: string }) => {
  const sortedChats = useMemo(() => {
    return chats.sort((a: Chat, b: Chat) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [chats]);

  const getActionPanel = (question: string) => (
    <ActionPanel>
      <PrimaryAction title="Get Answer" onAction={() => use.chats.ask(question)} />
      <PreferencesActionSection />
    </ActionPanel>
  );

  return sortedChats.length === 0 ? (
    <EmptyView />
  ) : (
    <List.Section title="Results" subtitle={sortedChats.length.toLocaleString()}>
      {sortedChats.map((sortedChat, i) => {
        return (
          <List.Item
            id={sortedChat.id}
            key={sortedChat.id}
            accessories={[{ text: `#${use.chats.data.length - i}` }]}
            title={sortedChat.question}
            detail={sortedChat.answer && <AnswerDetailView chat={sortedChat} streamData={use.chats.streamData} />}
            actions={use.chats.isLoading ? undefined : getActionPanel(question)}
          />
        );
      })}
    </List.Section>
  );
};
