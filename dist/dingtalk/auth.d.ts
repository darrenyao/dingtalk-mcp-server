export interface Auth {
    getAppAccessToken(): Promise<string>;
    getUserToken(code: string): Promise<string>;
}
export declare function getAuth(appKey: string, appSecret: string): Auth;
