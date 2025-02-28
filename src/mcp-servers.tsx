import { List, ActionPanel, Action, Icon, Color, showToast, Toast, confirmAlert, Alert } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { MCPServer } from "./views/mcp-servers/types";
import AddEditMCPServer from "./views/mcp-servers/AddEditMCPServer";
import { getColorForKey } from "./lib/utils/get-key-color";

const MCPServers = () => {
  const {
    value: mcpServers = [],
    setValue: setMcpServers,
    isLoading: isLoadingStorage,
  } = useLocalStorage<MCPServer[]>("mcp-servers", []);

  const handleDeleteServer = async (id: string) => {
    const confirmed = await confirmAlert({
      title: "Delete MCP Server",
      message: "Are you sure you want to delete this server? This action cannot be undone.",
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      const updatedServers = mcpServers.filter((server: MCPServer) => server.id !== id);
      await setMcpServers(updatedServers);
      showToast({
        style: Toast.Style.Success,
        title: "MCP Server deleted",
      });
    }
  };

  return (
    <List
      isLoading={isLoadingStorage}
      searchBarPlaceholder="Search MCP servers..."
      isShowingDetail
      actions={
        <ActionPanel>
          <Action.Push
            icon={Icon.Plus}
            title="Add New Server"
            target={<AddEditMCPServer setMcpServers={setMcpServers} servers={mcpServers} />}
          />
        </ActionPanel>
      }
    >
      {mcpServers.map((server: MCPServer, serverIndex: number) => (
        <List.Item
          key={`${server.id}-${serverIndex}`}
          id={server.id}
          title={server.name}
          icon={Icon.Globe}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="ID" text={server.id} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Server Name" text={server.name} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Command to Run" text={server.command} />

                  {Object.keys(server.env).length > 0 && (
                    <>
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Environment Variables" />
                      {Object.entries(server.env).map(([key, value], envIndex) => (
                        <List.Item.Detail.Metadata.Label
                          key={`${key}-${envIndex}`}
                          title={key}
                          text={value}
                          icon={{ source: Icon.Key, tintColor: getColorForKey(key) }}
                        />
                      ))}
                    </>
                  )}
                  {Object.keys(server.env).length === 0 && (
                    <>
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Environment Variables" text="None" />
                    </>
                  )}
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <Action.Push
                icon={Icon.Plus}
                title="Add New Server"
                target={<AddEditMCPServer setMcpServers={setMcpServers} servers={mcpServers} />}
              />
              <Action.Push
                icon={Icon.Pencil}
                title="Edit Server"
                target={<AddEditMCPServer setMcpServers={setMcpServers} servers={mcpServers} serverToEdit={server} />}
              />
              <ActionPanel.Section>
                <Action
                  icon={{ source: Icon.Trash, tintColor: Color.Red }}
                  title="Delete Server"
                  style={Action.Style.Destructive}
                  onAction={() => handleDeleteServer(server.id)}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
      {mcpServers.length === 0 && !isLoadingStorage && (
        <List.EmptyView icon={Icon.Globe} title="No MCP Servers" description="Press return to add a new server" />
      )}
    </List>
  );
};

export default MCPServers;
