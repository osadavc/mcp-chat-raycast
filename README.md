# MCP X Raycast Chat

## AI Chat with Model Context Protocol (MCP) Servers

MCP Chat is a [Raycast](https://raycast.com) extension that lets you chat with AI models through any MCP servers you have configured. It provides a seamless interface to interact with various AI services using the Model Context Protocol.

## Features

- **Chat with AI**: Ask questions and get answers using OpenAI-compatible models
- **MCP Server Management**: Configure and manage multiple MCP servers
- **Tool Integration**: Leverage various MCP server tools for enhanced AI interactions
- **Custom Environment Variables**: Configure environment-specific settings for each MCP server

## Configuration

### Extension Preferences

- **OpenAI Compatible API Key**: Your API key for accessing OpenAI or compatible APIs
- **OpenAI Compatible Model**: The model to use (default: gpt-4o-mini)
- **Base URL**: The base URL for the OpenAI compatible API (default: https://api.openai.com/v1)

### MCP Servers

Configure your MCP servers through the "MCP Servers" command in Raycast. Each server requires:

- **Name**: A descriptive name for the server
- **Command**: The command to run the server
- **Environment Variables**: Any required environment variables for the server

## Usage

### Ask AI

1. Launch Raycast
2. Search for "Ask AI"
3. Type your question in the search bar
4. Press Enter to get an answer

### Manage MCP Servers

1. Launch Raycast
2. Search for "MCP Servers"
3. Add, edit, or delete your MCP server configurations


## Development

```bash
# Run in development mode
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run fix-lint
```