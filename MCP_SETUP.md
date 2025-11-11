# MCP Server Setup Guide

## What is MCP?

**Model Context Protocol (MCP)** allows Claude Desktop to connect to your Second Brain and query your saved knowledge directly from conversations!

## Features

Your Second Brain MCP server exposes:

### 🛠️ Tools (Actions Claude can perform)

1. **search_items** - Search through saved items using natural language
   - Example: "What videos did I save about AI?"
   - Example: "Show me articles from last month"

2. **create_item** - Save new items to your Second Brain
   - Example: "Save this as a note: Meeting notes from today..."

3. **get_item_details** - Get full details of a specific item

4. **list_recent_items** - List recently saved items

### 📚 Resources (Data Claude can access)

1. **Recent Items** - Access your 20 most recent saves
2. **Knowledge Base Statistics** - See stats about your content

## Setup Instructions

### Step 1: Locate Claude Desktop Config

Find your Claude Desktop config file at:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Add Second Brain MCP Server

Open `claude_desktop_config.json` and add this configuration:

```json
require('dotenv').config();
{
  "mcpServers": {
    "second-brain": {
      "command": "node",
      "args": [
        "C:\\projects\\second_brain\\backend\\src\\mcp-server.js"
      ],
      "env": {
        "MONGO_URI": process.env.MONGO_URI,
        "ANTHROPY_API_KEY": process.env.ANTHROPY_API_KEY,
        "ANTHROPIC_BASE_URL": process.env.ANTHROPIC_BASE_URL
      }
    }
  }
}
```

**⚠️ Important:**
- Replace the path with your actual project path
- On Windows, use double backslashes (`\\`) or forward slashes (`/`)
- If you already have other MCP servers, add this to your existing `mcpServers` object

### Step 3: Restart Claude Desktop

1. Completely quit Claude Desktop
2. Restart it
3. Look for the 🔌 icon in the bottom right - this means MCP is connected!

### Step 4: Test It Out!

Try these prompts in Claude Desktop:

1. **Search your knowledge:**
   - "What videos have I saved about AI?"
   - "Show me my recent notes"
   - "Find articles about JavaScript"

2. **Save new items:**
   - "Save this as a note: Remember to review project documentation"
   - "Create a todo: Follow up with the team tomorrow"

3. **Get statistics:**
   - "How many items are in my second brain?"
   - "What types of content have I saved?"

## Testing Locally

You can test the MCP server locally before adding it to Claude Desktop:

```bash
cd backend
npm run mcp
```

The server will start and wait for MCP client connections via stdio.

## Troubleshooting

### Server not appearing in Claude Desktop

1. Check the config file syntax (must be valid JSON)
2. Verify the path to `mcp-server.js` is correct
3. Check Claude Desktop logs for errors
4. Make sure Node.js is installed and accessible from command line

### "MongoDB connection failed"

1. Verify your MongoDB connection string in the config
2. Make sure you have internet connection
3. Check MongoDB Atlas whitelist settings

### Commands not working

1. Make sure the 🔌 icon is green in Claude Desktop
2. Try restarting Claude Desktop
3. Check that backend dependencies are installed: `npm install`

## How It Works

```
Claude Desktop  ←→  MCP Server  ←→  MongoDB
                     (stdio)         (Your Data)
```

1. You ask Claude a question about your saved content
2. Claude calls the MCP server via stdio protocol
3. MCP server queries your MongoDB database
4. Results are returned to Claude
5. Claude presents the information naturally in conversation

## Security Notes

- The MCP server runs locally on your machine
- Communication is via stdio (not over network)
- Your credentials are in the Claude Desktop config (local file)
- No data is sent to external servers except your existing MongoDB

## Next Steps

Once MCP is working, try:
- Asking Claude to help organize your knowledge
- Using Claude to find connections between saved items
- Having Claude summarize your saved articles
- Creating new items directly from Claude Desktop conversations

Enjoy your AI-powered Second Brain!
