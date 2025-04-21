declare module '@alicloud/dingtalk/oauth2_1_0' {
  import { Config } from '@alicloud/openapi-client';

  export interface GetTokenRequest {
    clientId: string;
    clientSecret: string;
    grantType: string;
  }

  export interface GetTokenResponse {
    body: {
      accessToken?: string;
      expiresIn?: number;
    };
  }

  export default class DingTalkOAuth2 {
    constructor(config: Config);
    getToken(appKey: string, request: GetTokenRequest): Promise<GetTokenResponse>;
  }
}

declare module '@alicloud/dingtalk/contact_1_0' {
  import { Config } from '@alicloud/openapi-client';

  export interface SearchUserRequest {
    query: string;
    offset: number;
    size: number;
    exactMatch: boolean;
  }

  export interface GetUserRequest {
    userId: string;
  }

  export interface DingTalkUser {
    userId: string;
    name?: string;
    mobile?: string;
    email?: string;
    department?: string[];
    jobNumber?: string;
    orgEmail?: string;
    telephone?: string;
  }

  export interface SearchUserResponse {
    body: {
      list?: DingTalkUser[];
    };
  }

  export interface GetUserResponse {
    body: DingTalkUser;
  }

  export default class DingTalkContact {
    constructor(config: Config);
    searchUser(request: SearchUserRequest, options?: { headers: Record<string, string> }): Promise<SearchUserResponse>;
    getUser(request: GetUserRequest, options?: { headers: Record<string, string> }): Promise<GetUserResponse>;
  }
}

declare module '@alicloud/dingtalk/message_1_0' {
  import { Config } from '@alicloud/openapi-client';

  export interface SendMessageRequest {
    agentId: string;
    userIdList: string[];
    msg: {
      msgtype: string;
      text: {
        content: string;
      };
    };
  }

  export interface SendMessageResponse {
    body: {
      success?: boolean;
    };
  }

  export default class DingTalkMessage {
    constructor(config: Config);
    sendMessage(request: SendMessageRequest, options?: { headers: Record<string, string> }): Promise<SendMessageResponse>;
  }
} 