import { Icon } from "@raycast/api";

import { List } from "@raycast/api";

export const EmptyView = () => (
  <List.EmptyView
    title="Ask anything!"
    description={
      "Type your question or prompt from the search bar and hit the enter key to get a response by using your MCP servers"
    }
    icon={Icon.QuestionMark}
  />
);
