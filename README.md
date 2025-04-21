# 钉钉 MCP 服务器

这是一个钉钉的 Model Context Protocol (MCP) 服务器实现，允许 MCP 客户端与钉钉 API 进行交互。

## 功能特性

- 向钉钉用户发送私信
- 搜索钉钉用户
- 获取用户详细信息
- 使用钉钉应用凭证进行身份验证

## 环境要求

- Node.js 16 或更高版本
- 钉钉开发者账号及已创建的应用
- 应用凭证（AppKey 和 AppSecret）

## 安装配置

1. 克隆仓库：
```bash
git clone git@github.com:darrenyao/dingtalk-mcp-server.git
cd dingtalk-mcp-server
```

2. 安装依赖：
```bash
npm install
```

3. 在根目录创建 `.env` 文件并配置钉钉应用凭证：
```env
DINGTALK_APP_KEY=your_app_key
DINGTALK_APP_SECRET=your_app_secret
DINGTALK_AGENT_ID=your_agent_id
```

## 构建和运行

1. 构建项目：
```bash
npm run build
```

2. 启动服务器：
```bash
npm start
```

开发模式下使用热重载：
```bash
npm run dev
```

## 环境变量

- `DINGTALK_APP_KEY`: 钉钉应用的 AppKey
- `DINGTALK_APP_SECRET`: 钉钉应用的 AppSecret
- `DINGTALK_AGENT_ID`: 钉钉应用的 Agent ID

## 可用工具

服务器提供以下工具：

1. `dingtalk_send_message`: 向钉钉用户发送私信
   - 参数：
     - `user`: 接收消息的用户名
     - `content`: 消息内容

2. `dingtalk_search_users`: 搜索钉钉用户
   - 参数：
     - `query`: 搜索关键词
     - `exact_match`: 是否进行精确匹配（可选）

3. `dingtalk_get_user_info`: 获取用户详细信息
   - 参数：
     - `user_id`: 用户 ID

## 错误处理

服务器提供中文错误信息以提供更好的用户体验。常见错误包括：

- 认证失败
- 用户未找到
- 消息发送失败
- API 调用频率限制

## 许可证

MIT
