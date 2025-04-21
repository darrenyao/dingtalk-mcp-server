const $OpenApi = require('@alicloud/openapi-client');
const $Util = require('@alicloud/tea-util');
const pkg = require('@alicloud/dingtalk');
const DingTalkContact = require('@alicloud/dingtalk/contact_1_0');
const DingTalkIM = require('@alicloud/dingtalk/im_1_0');
const axios = require('axios');

interface DingTalkUser {
  userId: string;
  name?: string;
  mobile?: string;
  email?: string;
  department?: string[];
  jobNumber?: string;
  orgEmail?: string;
  telephone?: string;
  create_time?: number;
}

export interface UserInfo {
  userId: string;
  name?: string;
  mobile?: string;
  email?: string;
  department?: string[];
  job_number?: string;
  org_email?: string;
  telephone?: string;
  hired_date?: number;
}

export interface Auth {
  getAppAccessToken(): Promise<string>;
  getUserToken(code: string): Promise<string>;
}

export class DingtalkClient {
  private contactClient: any;
  private accessToken: string;
  private auth: Auth;

  constructor(accessToken: string, auth: Auth) {
    this.accessToken = accessToken;
    this.auth = auth;
    const config = new $OpenApi.Config({});
    config.protocol = 'https';
    config.regionId = 'central';
    this.contactClient = new DingTalkContact.default(config);
  }

  async sendTextMessage(
    content: string,
    options: {
      openConversationId?: string;
      receiverUserId?: string;
      msgType?: 'text' | 'reply' | 'markdown';
      code?: string;  // 用户授权码，用于获取用户token
    } = {}
  ): Promise<boolean> {
    try {
      // 获取用户token
      if (!options.code) {
        throw new Error('Missing authorization code');
      }
      const userToken = await this.auth.getUserToken(options.code);

      const config = new $OpenApi.Config({});
      config.protocol = 'https';
      config.regionId = 'central';
      const imClient = new DingTalkIM.default(config);

      const sendMessageHeaders = new DingTalkIM.SendPersonalMessageHeaders({});
      sendMessageHeaders.xAcsDingtalkAccessToken = userToken;  // 使用用户token

      const sendMessageRequest = new DingTalkIM.SendPersonalMessageRequest({
        content: JSON.stringify({
          content: content,
          at: {
            atUserIds: [],
            isAtAll: false
          }
        }),
        msgType: options.msgType || 'text',
        ...(options.openConversationId && { openConversationId: options.openConversationId }),
        ...(options.receiverUserId && { receiverUid: options.receiverUserId })
      });

      const response = await imClient.sendPersonalMessageWithOptions(
        sendMessageRequest,
        sendMessageHeaders,
        new $Util.RuntimeOptions({})
      );

      console.error('Send message response:', JSON.stringify(response, null, 2));

      return response.body?.success === 'true';
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  async searchUsers(query: string, exactMatch: boolean = false): Promise<any[]> {
    try {
      const searchUserHeaders = new DingTalkContact.SearchUserHeaders({});
      searchUserHeaders.xAcsDingtalkAccessToken = this.accessToken;

      const searchUserRequest = new DingTalkContact.SearchUserRequest({
        queryWord: query,
        offset: 0,
        size: 10,
        ...(exactMatch && { fullMatchField: 1 })
      });

      console.error('Search users request parameters:', {
        headers: {
          xAcsDingtalkAccessToken: searchUserHeaders.xAcsDingtalkAccessToken
        },
        request: {
          queryWord: searchUserRequest.queryWord,
          offset: searchUserRequest.offset,
          size: searchUserRequest.size,
          fullMatchField: searchUserRequest.fullMatchField
        }
      });

      const response = await this.contactClient.searchUserWithOptions(
        searchUserRequest,
        searchUserHeaders,
        new $Util.RuntimeOptions({})
      );

      console.error('Search users response:', {
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.body
      });

      const userIds = response.body.list || [];
      return userIds.map((userId: string) => ({ userId }));
    } catch (error: any) {
      console.error('Failed to search users:', {
        error: {
          code: error.code,
          message: error.message,
          data: error.data,
          statusCode: error.statusCode
        },
        query,
        exactMatch
      });
      return [];
    }
  }

  async getUserInfo(userId: string): Promise<UserInfo | null> {
    try {
      const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${this.accessToken}`;
      const response = await axios.post(url, {
        userid: userId,
        language: 'zh_CN'
      });

      const data = response.data;
      
      if (data.errcode !== 0 && data.errcode !== '0') {
        throw new Error(`Failed to get user info: ${data.errmsg}`);
      }

      console.error('Raw user info response:', JSON.stringify(data, null, 2));

      const result = data.result;
      if (!result) {
        return null;
      }

      const userInfo: UserInfo = {
        userId: result.userid,
        name: result.name,
        mobile: result.mobile,
        email: result.email,
        department: Array.isArray(result.dept_id_list) 
          ? result.dept_id_list 
          : (typeof result.dept_id_list === 'string' 
            ? result.dept_id_list.replace(/[\[\]]/g, '').split(',').map(Number)
            : undefined),
        job_number: result.job_number,
        org_email: result.org_email,
        telephone: result.telephone,
        hired_date: result.create_time
      };

      console.error('Processed user info:', JSON.stringify(userInfo, null, 2));

      return userInfo;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  async getUsersInfo(userIds: string[]): Promise<UserInfo[]> {
    const users: UserInfo[] = [];

    try {
      for (const userId of userIds) {
        const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${this.accessToken}`;
        const response = await axios.post(url, {
          userid: userId,
          language: 'zh_CN'
        });

        const data = response.data;
        
        if (data.errcode !== 0 && data.errcode !== '0') {
          throw new Error(`Failed to get user info: ${data.errmsg}`);
        }

        console.error('User info response:', JSON.stringify(data, null, 2));

        const result = data.result;
        if (result) {
          users.push({
            userId: result.userid,
            name: result.name,
            mobile: result.mobile,
            email: result.email,
            department: Array.isArray(result.dept_id_list) 
              ? result.dept_id_list 
              : (typeof result.dept_id_list === 'string' 
                ? result.dept_id_list.replace(/[\[\]]/g, '').split(',').map(Number)
                : undefined),
            job_number: result.job_number,
            org_email: result.org_email,
            telephone: result.telephone,
            hired_date: result.create_time
          });
        }
      }
      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get users info: ${error.message}`);
      }
      throw new Error('Failed to get users info: Unknown error');
    }
  }
} 