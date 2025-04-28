# 钉钉 MCP 服务器

钉钉的 Model Context Protocol (MCP) 服务器实现，使 Claude 能够与钉钉工作空间进行交互。

![image](https://github.com/user-attachments/assets/ac653ce5-057b-4eab-9732-5e23df8af3f7)


## 工具

1. `dingtalk_search_users`
   - 搜索钉钉用户
   - 必需参数：
     - `query` (string): 搜索关键词
   - 可选参数：
     - `exact_match` (boolean, 默认: false): 是否进行精确匹配
   - 返回：匹配的用户列表及其基本信息

2. `dingtalk_get_user_info`
   - 获取用户详细信息
   - 必需参数：
     - `user_id` (string): 用户 ID
   - 返回：用户的详细信息，包括：
     - 姓名
     - 工号
     - 部门
     - 入职时间
     - 联系方式（手机、邮箱等）

3. `dingtalk_send_message`
   - 向钉钉用户发送私信
   - 必需参数：
     - `user` (string): 接收消息的用户名称
     - `content` (string): 消息内容
   - 返回：消息发送确认

## 设置

1. 创建钉钉应用：
   - 访问[钉钉开发者后台](https://open-dev.dingtalk.com)
   - 点击"创建应用"
   - 选择"企业内部应用"
   - 填写应用信息并创建

2. 配置应用权限：
   在应用详情页面配置以下权限：
   - `userinfo`: 获取用户信息
   - `message`: 发送消息
   - `user`: 获取用户列表

3. 获取应用凭证：
   - 保存应用的 AppKey 和 AppSecret

### 与 Claude Desktop 配合使用

在 `claude_desktop_config.json` 中添加以下配置：

#### npx 方式

```json
{
  "mcpServers": {
    "dingtalk": {
      "command": "npx",
      "args": [
        "-y",
        "@darrenyao/server-dingtalk"
      ],
      "env": {
        "DINGTALK_APP_KEY": "your_app_key",
        "DINGTALK_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

#### docker 方式

```json
{
  "mcpServers": {
    "dingtalk": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "DINGTALK_APP_KEY",
        "-e",
        "DINGTALK_APP_SECRET",
        "mcp/dingtalk"
      ],
      "env": {
        "DINGTALK_APP_KEY": "your_app_key",
        "DINGTALK_APP_SECRET": "your_app_secret"
      }
    }
  }
}
```

### 环境变量

1. `DINGTALK_APP_KEY`: 必需。钉钉应用的 AppKey
2. `DINGTALK_APP_SECRET`: 必需。钉钉应用的 AppSecret

### 故障排除

如果遇到权限错误，请检查：
1. 应用是否已正确配置所需权限
2. 应用是否已正确安装到企业
3. 应用凭证是否正确配置
4. 应用是否已获得必要的访问权限

## 构建

Docker 构建：

```bash
docker build -t mcp/dingtalk -f Dockerfile .
```

## 许可证

本项目采用 MIT 许可证。这意味着您可以自由使用、修改和分发软件，但需遵守 MIT 许可证的条款和条件。更多详情请参阅项目仓库中的 LICENSE 文件。
