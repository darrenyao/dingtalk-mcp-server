import { Config } from '@alicloud/openapi-client';
import { GetTokenRequest } from '@alicloud/dingtalk/oauth2_1_0';
import { default as DingTalkOAuth2 } from '@alicloud/dingtalk/oauth2_1_0';

export class DingTalkAuth {
  private client: DingTalkOAuth2;
  private appKey: string;
  private appSecret: string;
  private accessToken: string = '';
  private tokenExpiresAt: number = 0;

  constructor(appKey: string, appSecret: string) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    
    // Initialize DingTalk client
    const config = new Config({});
    config.protocol = 'https';
    config.regionId = 'central';
    this.client = new DingTalkOAuth2(config);
  }

  async getAppAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      // Get new token using DingTalk SDK
      const getTokenRequest = new GetTokenRequest({
        clientId: this.appKey,
        clientSecret: this.appSecret,
        grantType: 'client_credentials',
      });

      const response = await this.client.getToken(this.appKey, getTokenRequest);
      
      if (response.body && response.body.accessToken) {
        // Cache the token
        this.accessToken = response.body.accessToken;
        this.tokenExpiresAt = Date.now() + (response.body.expiresIn * 1000);
        return this.accessToken;
      } else {
        throw new Error('Failed to get access token: Invalid response');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get access token: ${error.message}`);
      }
      throw new Error('Failed to get access token: Unknown error');
    }
  }
}

export function getAuth(): DingTalkAuth {
  const appKey = process.env.DINGTALK_APP_KEY;
  const appSecret = process.env.DINGTALK_APP_SECRET;

  if (!appKey || !appSecret) {
    throw new Error('DINGTALK_APP_KEY and DINGTALK_APP_SECRET must be set in environment variables');
  }

  return new DingTalkAuth(appKey, appSecret);
} 