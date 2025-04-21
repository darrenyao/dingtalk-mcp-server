"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
exports.getAuth = getAuth;
const $OpenApi = require('@alicloud/openapi-client');
const pkg = require('@alicloud/dingtalk');
const DingTalkOAuth = require('@alicloud/dingtalk/oauth2_1_0');
class Auth {
    constructor(appKey, appSecret) {
        this.accessToken = '';
        this.tokenExpireTime = 0;
        this.appKey = appKey;
        this.appSecret = appSecret;
        const config = new $OpenApi.Config({});
        config.protocol = 'https';
        config.regionId = 'central';
        this.client = new DingTalkOAuth.default(config);
    }
    async getAppAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpireTime) {
            return this.accessToken;
        }
        try {
            const request = {
                appKey: this.appKey,
                appSecret: this.appSecret
            };
            const response = await this.client.getAccessTokenWithOptions(request, {}, {});
            if (!response?.body?.accessToken) {
                throw new Error('Failed to get access token: empty response');
            }
            this.accessToken = response.body.accessToken;
            this.tokenExpireTime = Date.now() + (response.body.expireIn * 1000);
            return this.accessToken;
        }
        catch (error) {
            console.error('Failed to get access token:', error);
            throw error;
        }
    }
}
exports.Auth = Auth;
function getAuth(appKey, appSecret) {
    return new Auth(appKey, appSecret);
}
//# sourceMappingURL=auth.js.map