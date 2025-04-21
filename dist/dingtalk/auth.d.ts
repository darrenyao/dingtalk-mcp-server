export declare class Auth {
    private appKey;
    private appSecret;
    private accessToken;
    private tokenExpireTime;
    private client;
    constructor(appKey: string, appSecret: string);
    getAppAccessToken(): Promise<string>;
}
export declare function getAuth(appKey: string, appSecret: string): Auth;
