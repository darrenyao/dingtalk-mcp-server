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
}
export declare class DingtalkClient {
    private contactClient;
    private accessToken;
    constructor(accessToken: string);
    sendTextMessage(content: string, options?: {
        openConversationId?: string;
        receiverUserId?: string;
        msgType?: 'text' | 'reply' | 'markdown';
    }): Promise<boolean>;
    searchUsers(query: string, exactMatch?: boolean): Promise<any[]>;
    getUserInfo(userId: string): Promise<UserInfo | null>;
    getUsersInfo(userIds: string[]): Promise<UserInfo[]>;
}
