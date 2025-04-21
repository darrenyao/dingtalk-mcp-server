declare module '@alicloud/dingtalk/im_1_0.js' {
  export class SendPersonalMessageHeaders {
    xAcsDingtalkAccessToken?: string;
  }

  export class SendPersonalMessageRequest {
    content: string;
    openConversationId?: string;
    receiverUserId?: string;
    msgType: 'text' | 'reply' | 'markdown';
  }

  export default class DingTalkIM {
    constructor(config: any);
    sendPersonalMessageWithOptions(
      request: SendPersonalMessageRequest,
      headers: SendPersonalMessageHeaders,
      runtime: any
    ): Promise<any>;
  }
}

declare module '@alicloud/dingtalk/contact_1_0.js' {
  export class SearchUserHeaders {
    xAcsDingtalkAccessToken?: string;
  }

  export class SearchUserRequest {
    query: string;
    exactMatch: boolean;
  }

  export class GetUserHeaders {
    xAcsDingtalkAccessToken?: string;
  }

  export class GetUserRequest {
    userId: string;
  }

  export default class DingTalkContact {
    constructor(config: any);
    searchUserWithOptions(
      request: SearchUserRequest,
      headers: SearchUserHeaders,
      runtime: any
    ): Promise<any>;
    getUserWithOptions(
      request: GetUserRequest,
      headers: GetUserHeaders,
      runtime: any
    ): Promise<any>;
  }
}

declare module '@alicloud/dingtalk' {
  export class DingTalk {
    constructor(config: Record<string, any>);
    getAccessToken(request: GetAccessTokenRequest, headers: Record<string, string>): Promise<GetAccessTokenResponse>;
  }

  export interface GetAccessTokenRequest {
    appKey: string;
    appSecret: string;
  }

  export interface GetAccessTokenResponse {
    body: {
      accessToken: string;
      expiresIn: number;
    };
  }
} 