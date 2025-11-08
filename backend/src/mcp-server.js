#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const Item = require('./models/Item');
const { parseSearchQuery, buildMongoQuery } = require('./services/queryParserService');
const { detectType } = require('./utils/parser');
const { extractMetadata } = require('./utils/metadataExtractor');

/**
 * MCP Server for Second Brain
 * Exposes knowledge base to Claude Desktop and other MCP clients
 */
class SecondBrainMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'second-brain',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_items',
          description: 'Search through saved items using natural language. Searches across titles, content, URLs, and tags.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Natural language search query (e.g., "videos about AI", "articles from last month")',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'create_item',
          description: 'Create a new item in the second brain (note, link, video, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the item',
              },
              content: {
                type: 'string',
                description: 'Content/description of the item',
              },
              url: {
                type: 'string',
                description: 'URL if it\'s a web resource (optional)',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for categorization (optional)',
              },
              type: {
                type: 'string',
                enum: ['note', 'article', 'video', 'todo', 'image', 'other'],
                description: 'Type of content (optional, will be auto-detected if not provided)',
              },
            },
            required: ['title', 'content'],
          },
        },
        {
          name: 'get_item_details',
          description: 'Get full details of a specific item by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'MongoDB ObjectId of the item',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'list_recent_items',
          description: 'List recently saved items',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of items to return (default: 10, max: 50)',
                default: 10,
              },
              type: {
                type: 'string',
                enum: ['note', 'article', 'video', 'todo', 'image', 'other', 'all'],
                description: 'Filter by content type (optional)',
              },
            },
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_items':
            return await this.searchItems(args.query);

          case 'create_item':
            return await this.createItem(args);

          case 'get_item_details':
            return await this.getItemDetails(args.id);

          case 'list_recent_items':
            return await this.listRecentItems(args.limit || 10, args.type);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'secondbrain://items/recent',
          name: 'Recent Items',
          description: 'Recently saved items in the second brain',
          mimeType: 'application/json',
        },
        {
          uri: 'secondbrain://items/stats',
          name: 'Knowledge Base Statistics',
          description: 'Statistics about your second brain content',
          mimeType: 'application/json',
        },
      ],
    }));

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        if (uri === 'secondbrain://items/recent') {
          const items = await Item.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .select('title type url tags createdAt');

          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(items, null, 2),
              },
            ],
          };
        }

        if (uri === 'secondbrain://items/stats') {
          const stats = await this.getStats();

          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(stats, null, 2),
              },
            ],
          };
        }

        throw new Error(`Unknown resource: ${uri}`);
      } catch (error) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  // Tool implementations
  async searchItems(query) {
    const parsedParams = await parseSearchQuery(query);
    const mongoQuery = buildMongoQuery(parsedParams);

    const items = await Item.find(mongoQuery)
      .sort({ createdAt: -1 })
      .limit(20);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${items.length} items matching "${query}":\n\n${items
            .map(
              (item, i) =>
                `${i + 1}. **${item.title}** (${item.type})\n   ${item.content.substring(0, 150)}${
                  item.content.length > 150 ? '...' : ''
                }\n   ID: ${item._id}\n   Created: ${item.createdAt.toLocaleDateString()}\n   ${
                  item.url ? `URL: ${item.url}` : ''
                }`
            )
            .join('\n\n')}`,
        },
      ],
    };
  }

  async createItem(itemData) {
    const { title, content, url, tags = [], type } = itemData;

    let finalType = type;
    let metadata = {};

    // Auto-detect type if not provided
    if (!finalType && url) {
      const extractedMetadata = await extractMetadata(url);
      if (extractedMetadata?.type) {
        finalType = extractedMetadata.type;
        metadata = extractedMetadata;
      }
    }

    if (!finalType) {
      finalType = detectType({ url, content });
    }

    const item = new Item({
      title,
      content,
      url,
      tags,
      type: finalType,
      metadata,
      userId: 'mcp_user',
    });

    await item.save();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Created new item:\n**${item.title}**\nType: ${item.type}\nID: ${item._id}`,
        },
      ],
    };
  }

  async getItemDetails(id) {
    const item = await Item.findById(id);

    if (!item) {
      throw new Error(`Item not found with ID: ${id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `**${item.title}**\n\nType: ${item.type}\nCreated: ${item.createdAt.toLocaleString()}\nTags: ${
            item.tags.join(', ') || 'None'
          }\n\n${item.content}\n\n${item.url ? `URL: ${item.url}` : ''}\n\n${
            item.metadata?.summary ? `\n**Summary:**\n${item.metadata.summary}` : ''
          }`,
        },
      ],
    };
  }

  async listRecentItems(limit = 10, type = null) {
    const filter = type && type !== 'all' ? { type } : {};
    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50));

    return {
      content: [
        {
          type: 'text',
          text: `**Recent Items** ${type ? `(${type})` : ''}:\n\n${items
            .map(
              (item, i) =>
                `${i + 1}. **${item.title}** (${item.type})\n   Created: ${item.createdAt.toLocaleDateString()}\n   ID: ${
                  item._id
                }`
            )
            .join('\n\n')}`,
        },
      ],
    };
  }

  async getStats() {
    const totalItems = await Item.countDocuments();
    const typeStats = await Item.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentCount = await Item.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    return {
      totalItems,
      itemsByType: typeStats.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      addedLastWeek: recentCount,
    };
  }

  async run() {
    // Connect to MongoDB
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('[MCP Server] Connected to MongoDB');
    } catch (error) {
      console.error('[MCP Server] MongoDB connection failed:', error);
      process.exit(1);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP Server] Second Brain MCP server running on stdio');
  }
}

// Run the server
const server = new SecondBrainMCPServer();
server.run().catch(console.error);
