# DingTalk MCP Server

This is a Model Context Protocol (MCP) server implementation for DingTalk, allowing MCP clients to interact with DingTalk's API.

## Features

- Send private messages to DingTalk users
- Search for DingTalk users
- Get detailed user information
- Authentication with DingTalk app credentials

## Prerequisites

- Node.js 16 or later
- A DingTalk developer account with an app created
- App credentials (AppKey and AppSecret)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd server-dingtalk
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your DingTalk app credentials:
```env
DINGTALK_APP_KEY=your_app_key
DINGTALK_APP_SECRET=your_app_secret
DINGTALK_AGENT_ID=your_agent_id
```

## Building and Running

1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

For development with hot reloading:
```bash
npm run dev
```

## Environment Variables

- `DINGTALK_APP_KEY`: Your DingTalk app's AppKey
- `DINGTALK_APP_SECRET`: Your DingTalk app's AppSecret
- `DINGTALK_AGENT_ID`: Your DingTalk app's Agent ID

## Available Tools

The server provides the following tools:

1. `dingtalk_send_message`: Send a private message to a DingTalk user
   - Parameters:
     - `user`: The name of the user to send the message to
     - `content`: The message content

2. `dingtalk_search_users`: Search for DingTalk users
   - Parameters:
     - `query`: The search query
     - `exact_match`: Whether to perform an exact match search (optional)

3. `dingtalk_get_user_info`: Get detailed information about a user
   - Parameters:
     - `user_id`: The ID of the user

## Error Handling

The server provides detailed error messages in Chinese for better user experience. Common errors include:

- Authentication failures
- User not found
- Message sending failures
- API rate limiting

## License

MIT
