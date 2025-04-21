const $OpenApi = require('@alicloud/openapi-client');
const pkg = require('@alicloud/dingtalk');
const DingTalkOAuth2 = require('@alicloud/dingtalk/oauth2_1_0');

interface GetAccessTokenRequest {
  appKey: string;
  appSecret: string;
}

interface GetAccessTokenResponse {
  accessToken: string;
  expireIn: number;
}

export interface Auth {
  getAppAccessToken(): Promise<string>;
  getUserToken(code: string): Promise<string>;
}

export function getAuth(appKey: string, appSecret: string): Auth {
  let appAccessToken = '';
  let appAccessTokenExpireTime: number = 0;

  const config = new $OpenApi.Config({});
  config.protocol = 'https';
  config.regionId = 'central';

  const oauth2Client = new DingTalkOAuth2.default(config);

  return {
    async getAppAccessToken(): Promise<string> {
      const now = Date.now();
      if (appAccessToken && now < appAccessTokenExpireTime) {
        return appAccessToken;
      }

      try {
        const response = await oauth2Client.getAccessToken({
          appKey: appKey,
          appSecret: appSecret,
        });

        if (!response?.body?.accessToken) {
          throw new Error('Failed to get access token');
        }

        appAccessToken = response.body.accessToken;
        // Set expire time 2 hours from now (minus 5 minutes for safety)
        appAccessTokenExpireTime = now + (response.body.expireIn * 1000) - (5 * 60 * 1000);

        return appAccessToken;
      } catch (error) {
        console.error('Failed to get app access token:', error);
        throw error;
      }
    },

    async getUserToken(code: string): Promise<string> {
      try {
        const getUserTokenRequest = new DingTalkOAuth2.GetUserTokenRequest({
          clientId: appKey,
          clientSecret: appSecret,
          code: code,
          grantType: "authorization_code"
        });

        const response = await oauth2Client.getUserToken(getUserTokenRequest);
        console.error('Get user token response:', JSON.stringify(response, null, 2));

        if (!response?.body?.accessToken) {
          throw new Error('Failed to get user token');
        }

        return response.body.accessToken;
      } catch (error) {
        console.error('Failed to get user token:', error);
        throw error;
      }
    }
  };
} 