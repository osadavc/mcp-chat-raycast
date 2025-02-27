import { ActionPanel, List } from "@raycast/api";
import { useQuestion } from "./hooks/use-question";
import { useChat } from "./hooks/use-chat";
import { ChatView } from "./views/chat-view";
import { PreferencesActionSection } from "./actions/preferences";
import { PrimaryAction } from "./actions";

const AskAI = () => {
  const question = useQuestion({ initialQuestion: "" });
  const chats = useChat([]);

  const getActionPanel = (question: string) => (
    <ActionPanel>
      <PrimaryAction title="Get Answer" onAction={() => chats.ask(question)} />
      <PreferencesActionSection />
    </ActionPanel>
  );

  return (
    <List
      searchText={question.data}
      isShowingDetail={chats.data.length > 0 ? true : false}
      filtering={false}
      isLoading={question.isLoading || chats.isLoading}
      onSearchTextChange={question.update}
      navigationTitle="Ask"
      selectedItemId={chats.selectedChatId || undefined}
      actions={getActionPanel(question.data)}
      onSelectionChange={(id) => {
        if (id !== chats.selectedChatId) {
          chats.setSelectedChatId(id);
        }
      }}
      searchBarPlaceholder={chats.data.length > 0 ? "Ask another question..." : "Ask a question..."}
    >
      <ChatView chats={chats.data} use={{ chats }} />
    </List>
  );
};

export default AskAI;
