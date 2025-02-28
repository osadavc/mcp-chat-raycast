import { useState } from "react";
import { Form, ActionPanel, Action, useNavigation, showToast, Toast } from "@raycast/api";
import { MCPServer } from "./types";

const AddEditMCPServer = ({
  setMcpServers,
  servers,
  serverToEdit,
}: {
  setMcpServers: (servers: MCPServer[]) => Promise<void>;
  servers: MCPServer[];
  serverToEdit?: MCPServer;
}) => {
  const { pop } = useNavigation();
  const [nameError, setNameError] = useState<string | undefined>();
  const [commandError, setCommandError] = useState<string | undefined>();

  const handleSubmit = async (values: { name: string; command: string }) => {
    if (!values.name.trim()) {
      setNameError("Server name is required");
      return;
    }

    if (!values.command.trim()) {
      setCommandError("Command is required");
      return;
    }

    try {
      if (serverToEdit) {
        const updatedServers = servers.map((server) =>
          server.id === serverToEdit.id ? { ...server, name: values.name, command: values.command } : server,
        );

        await setMcpServers(updatedServers);
        showToast({ style: Toast.Style.Success, title: "MCP Server updated" });
      } else {
        await setMcpServers([
          ...servers,
          {
            id: Date.now().toString(),
            name: values.name,
            command: values.command,
          },
        ]);
        showToast({ style: Toast.Style.Success, title: "MCP Server added" });
      }

      pop();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to save",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Server" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Server Name"
        placeholder="Enter server name"
        defaultValue={serverToEdit?.name}
        error={nameError}
        onChange={() => {
          if (nameError) setNameError(undefined);
        }}
        onBlur={(event) => {
          if (!event.target.value?.trim()) {
            setNameError("Server name is required");
          }
        }}
      />
      <Form.TextField
        id="command"
        title="Command"
        placeholder="Enter the MCP server command"
        defaultValue={serverToEdit?.command}
        error={commandError}
        onChange={() => {
          if (commandError) setCommandError(undefined);
        }}
        onBlur={(event) => {
          if (!event.target.value?.trim()) {
            setCommandError("Command is required");
          }
        }}
      />
    </Form>
  );
};

export default AddEditMCPServer;
