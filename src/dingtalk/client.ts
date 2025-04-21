import { Config } from '@alicloud/openapi-client';
import { default as DingTalkOAuth2 } from '@alicloud/dingtalk/oauth2_1_0';
import { default as DingTalkContact } from '@alicloud/dingtalk/contact_1_0';
import { default as DingTalkMessage } from '@alicloud/dingtalk/message_1_0';

interface DingTalkUser {
  userId: string;
  name?: string;
  mobile?: string;
  email?: string;
  department?: string[];
  jobNumber?: string;
  orgEmail?: string;
  telephone?: string;
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
}

export interface Auth {
  getAppAccessToken(): Promise<string>;
}

export class DingtalkClient {
  private auth: Auth;
  private contactClient: DingTalkContact;
  private messageClient: DingTalkMessage;

  constructor(auth: Auth) {
    this.auth = auth;
    
    // Initialize DingTalk clients
    const config = new Config({});
    config.protocol = 'https';
    config.regionId = 'central';
    
    this.contactClient = new DingTalkContact(config);
    this.messageClient = new DingTalkMessage(config);
  }

  async searchUsers(query: string, exact_match: boolean = false): Promise<UserInfo[]> {
    const accessToken = await this.auth.getAppAccessToken();
    
    try {
      const response = await this.contactClient.searchUser({
        query: query,
        offset: 0,
        size: 100,
        exactMatch: exact_match
      }, {
        headers: {
          'x-acs-dingtalk-access-token': accessToken
        }
      });

      if (response.body && response.body.list) {
        return response.body.list.map((user: DingTalkUser) => ({
          userId: user.userId,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          department: user.department,
          job_number: user.jobNumber,
          org_email: user.orgEmail,
          telephone: user.telephone
        }));
      }
      return [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search users: ${error.message}`);
      }
      throw new Error('Failed to search users: Unknown error');
    }
  }

  async getUsersInfo(userIds: string[]): Promise<UserInfo[]> {
    const accessToken = await this.auth.getAppAccessToken();
    const users: UserInfo[] = [];

    try {
      for (const userId of userIds) {
        const response = await this.contactClient.getUser({
          userId: userId
        }, {
          headers: {
            'x-acs-dingtalk-access-token': accessToken
          }
        });

        if (response.body) {
          const user = response.body as DingTalkUser;
          users.push({
            userId: user.userId,
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            department: user.department,
            job_number: user.jobNumber,
            org_email: user.orgEmail,
            telephone: user.telephone
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

  async getUserInfo(userId: string): Promise<UserInfo | null> {
    const accessToken = await this.auth.getAppAccessToken();

    try {
      const response = await this.contactClient.getUser({
        userId: userId
      }, {
        headers: {
          'x-acs-dingtalk-access-token': accessToken
        }
      });

      if (response.body) {
        const user = response.body as DingTalkUser;
        return {
          userId: user.userId,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          department: user.department,
          job_number: user.jobNumber,
          org_email: user.orgEmail,
          telephone: user.telephone
        };
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get user info: ${error.message}`);
      }
      throw new Error('Failed to get user info: Unknown error');
    }
  }

  async sendTextMessage(userId: string, content: string): Promise<boolean> {
    const accessToken = await this.auth.getAppAccessToken();

    try {
      const response = await this.messageClient.sendMessage({
        agentId: process.env.DINGTALK_AGENT_ID,
        userIdList: [userId],
        msg: {
          msgtype: 'text',
          text: {
            content: content
          }
        }
      }, {
        headers: {
          'x-acs-dingtalk-access-token': accessToken
        }
      });

      return response.body && response.body.success === true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }
      throw new Error('Failed to send message: Unknown error');
    }
  }
} 