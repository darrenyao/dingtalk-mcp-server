#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  Tool,
  CallToolRequest,
  ListResourcesRequest,
  ReadResourceRequest,
  GetPromptRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { DingtalkClient } from "./dingtalk/client.js";
import { getAuth } from "./dingtalk/auth.js";

/**
 * Type alias for a note object.
 */
type Note = { title: string, content: string };

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: { [id: string]: Note } = {
  "1": { title: "First Note", content: "This is note 1" },
  "2": { title: "Second Note", content: "This is note 2" }
};

// Type definitions for tool arguments
interface SendMessageArgs {
  user: string;
  content: string;
}

interface SearchUsersArgs {
  query: string;
  exact_match?: boolean;
}

interface GetUserInfoArgs {
  user_id: string;
}

// Tool definitions
const sendMessageTool: Tool = {
  name: "dingtalk_send_message",
  description: "Send a private message to a specific DingTalk user",
  inputSchema: {
    type: "object",
    properties: {
      user: {
        type: "string",
        description: "The name of the user to send the message to",
      },
      content: {
        type: "string",
        description: "The message content to send",
      },
    },
    required: ["user", "content"],
  },
};

const searchUsersTool: Tool = {
  name: "dingtalk_search_users",
  description: "Search for DingTalk users by name or other criteria",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to find users",
      },
      exact_match: {
        type: "boolean",
        description: "Whether to perform an exact match search",
        default: false,
      },
    },
    required: ["query"],
  },
};

const getUserInfoTool: Tool = {
  name: "dingtalk_get_user_info",
  description: "Get detailed information about a specific DingTalk user",
  inputSchema: {
    type: "object",
    properties: {
      user_id: {
        type: "string",
        description: "The ID of the user to get information about",
      },
    },
    required: ["user_id"],
  },
};

class DingTalkServer {
  private server: Server;
  private client: DingtalkClient;

  constructor() {
    this.server = new Server(
      {
        name: "DingTalk MCP Server",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.client = new DingtalkClient(getAuth());

    this.setupHandlers();
  }

  private setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [sendMessageTool, searchUsersTool, getUserInfoTool],
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "dingtalk_send_message": {
          const { user, content } = args as SendMessageArgs;
          return await this.handleSendMessage(user, content);
        }

        case "dingtalk_search_users": {
          const { query, exact_match } = args as SearchUsersArgs;
          return await this.handleSearchUsers(query, exact_match);
        }

        case "dingtalk_get_user_info": {
          const { user_id } = args as GetUserInfoArgs;
          return await this.handleGetUserInfo(user_id);
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // List resources handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async (request: ListResourcesRequest) => {
      return {
        resources: Object.entries(notes).map(([id, note]) => ({
          uri: `note:///${id}`,
          mimeType: "text/plain",
          name: note.title,
          description: `A text note: ${note.title}`
        }))
      };
    });

    // Read resource handler
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest) => {
      const url = new URL(request.params.uri);
      const id = url.pathname.replace(/^\//, '');
      const note = notes[id];

      if (!note) {
        throw new Error(`Note ${id} not found`);
      }

      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "text/plain",
          text: note.content
        }]
      };
    });

    // List prompts handler
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "summarize_notes",
            description: "Summarize all notes",
          }
        ]
      };
    });

    // Get prompt handler
    this.server.setRequestHandler(GetPromptRequestSchema, async (request: GetPromptRequest) => {
      if (request.params.name !== "summarize_notes") {
        throw new Error("Unknown prompt");
      }

      const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
        type: "resource" as const,
        resource: {
          uri: `note:///${id}`,
          mimeType: "text/plain",
          text: note.content
        }
      }));

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Please summarize the following notes:"
            }
          },
          ...embeddedNotes.map(note => ({
            role: "user" as const,
            content: note
          })),
          {
            role: "user",
            content: {
              type: "text",
              text: "Provide a concise summary of all the notes above."
            }
          }
        ]
      };
    });
  }

  private async handleSendMessage(user: string, content: string) {
    try {
      const users = await this.client.searchUsers(user);
      if (!users || users.length === 0) {
        return {
          content: [{
            type: "text",
            text: `未找到用户 '${user}'`,
          }],
        };
      }

      const userInfo = users[0];
      const userId = userInfo.userId;
      const userName = userInfo.name || user;

      if (!userId) {
        return {
          content: [{
            type: "text",
            text: `无法获取用户 '${user}' 的ID`,
          }],
        };
      }

      const success = await this.client.sendTextMessage(userId, content);
      if (success) {
        return {
          content: [{
            type: "text",
            text: `成功向 ${userName} 发送了私信: '${content}'`,
          }],
        };
      } else {
        return {
          content: [{
            type: "text",
            text: `向 ${userName} 发送私信失败`,
          }],
        };
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `发送消息时发生错误: ${error}`,
        }],
      };
    }
  }

  private async handleSearchUsers(query: string, exact_match: boolean = false) {
    try {
      const users = await this.client.searchUsers(query, exact_match);
      if (!users || users.length === 0) {
        return {
          content: [{
            type: "text",
            text: `未找到匹配的用户: ${query}`,
          }],
        };
      }

      const userDetails = await this.client.getUsersInfo(users.map(u => u.userId));
      if (!userDetails) {
        return {
          content: [{
            type: "text",
            text: `获取用户详细信息失败: ${query}`,
          }],
        };
      }

      let result = `找到 ${userDetails.length} 个匹配的用户：\n`;
      for (const user of userDetails) {
        result += `- ${user.name || '未知用户'} (ID: ${user.userId || '未知'})\n`;
        if (user.mobile) {
          result += `  手机号: ${user.mobile}\n`;
        }
        if (user.email) {
          result += `  邮箱: ${user.email}\n`;
        }
        if (user.department) {
          result += `  部门: ${user.department.join(', ')}\n`;
        }
        result += "\n";
      }

      return {
        content: [{
          type: "text",
          text: result,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `搜索用户时发生错误: ${error}`,
        }],
      };
    }
  }

  private async handleGetUserInfo(user_id: string) {
    try {
      const user = await this.client.getUserInfo(user_id);
      if (!user) {
        return {
          content: [{
            type: "text",
            text: `未找到用户: ${user_id}`,
          }],
        };
      }

      let result = "用户信息：\n";
      result += `- 姓名: ${user.name || '未知'}\n`;
      result += `- 用户ID: ${user.userId || '未知'}\n`;
      result += `- 工号: ${user.job_number || '未知'}\n`;
      if (user.mobile) {
        result += `- 手机号: ${user.mobile}\n`;
      }
      if (user.email) {
        result += `- 邮箱: ${user.email}\n`;
      }
      if (user.org_email) {
        result += `- 企业邮箱: ${user.org_email}\n`;
      }
      if (user.telephone) {
        result += `- 分机号: ${user.telephone}\n`;
      }

      return {
        content: [{
          type: "text",
          text: result,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `获取用户信息时发生错误: ${error}`,
        }],
      };
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

async function main() {
  const server = new DingTalkServer();
  await server.start();
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
