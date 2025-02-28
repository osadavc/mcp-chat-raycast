import { useState } from "react";
import { Form, ActionPanel, Action, useNavigation, showToast, Toast } from "@raycast/api";
import { MCPServer } from "./types";
import { toKebabCase } from "../../lib/utils/to-kebab-case";
import { envObjectToString, parseEnvString } from "../../lib/utils/env";
import { ensureUniqueId } from "../../lib/utils/unique-id";

type AddEditMCPServerProps = {
  setMcpServers: (servers: MCPServer[]) => Promise<void>;
  servers: MCPServer[];
  serverToEdit?: MCPServer;
};

const AddEditMCPServer = ({ setMcpServers, servers, serverToEdit }: AddEditMCPServerProps) => {
  const { pop } = useNavigation();
  const [nameError, setNameError] = useState<string | undefined>();
  const [commandError, setCommandError] = useState<string | undefined>();
  const [envVariables, setEnvVariables] = useState<string>(serverToEdit ? envObjectToString(serverToEdit.env) : "");

  const handleSubmit = async (values: { name: string; command: string; envVariables: string }) => {
    if (!values.name.trim()) {
      setNameError("Server name is required");
      return;
    }

    if (!values.command.trim()) {
      setCommandError("Command is required");
      return;
    }

    try {
      const kebabName = toKebabCase(values.name);

      const existingIds = servers
        .filter((server) => !serverToEdit || server.id !== serverToEdit.id)
        .map((server) => server.id);

      const uniqueId = ensureUniqueId(kebabName, existingIds, serverToEdit?.id);
      const env = parseEnvString(values.envVariables);

      if (serverToEdit) {
        const updatedServers = servers.map((server) =>
          server.id === serverToEdit.id
            ? {
                ...server,
                id: uniqueId,
                name: values.name,
                command: values.command,
                env,
              }
            : server,
        );

        await setMcpServers(updatedServers);
        showToast({ style: Toast.Style.Success, title: "MCP Server updated" });
      } else {
        await setMcpServers([
          ...servers,
          {
            id: uniqueId,
            name: values.name,
            command: values.command,
            env,
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
        title="Command to Run"
        placeholder="Enter command to run"
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

      <Form.Separator />

      <Form.TextArea
        id="envVariables"
        title="Environment Variables"
        placeholder="Enter one environment variable per line in the format:
KEY=value"
        value={envVariables}
        onChange={setEnvVariables}
      />
    </Form>
  );
};

export default AddEditMCPServer;
