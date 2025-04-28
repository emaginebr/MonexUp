import UserInfo from "../Domain/UserInfo";
import UserListPagedInfo from "../Domain/UserListPagedInfo";
import ProviderResult from "./ProviderResult";
import UserProviderResult from "./UserProviderResult";


interface IUserProvider {
    loading: boolean;
    loadingPassword: boolean;
    loadingUpdate: boolean;
    loadingSearch: boolean;
    
    userHasPassword: boolean;
    user: UserInfo;

    searchResult: UserListPagedInfo;

    setUser: (user: UserInfo) => void;
    getMe: () => Promise<UserProviderResult>;
    getUserByEmail: (email: string) => Promise<ProviderResult>;
    insert: (user: UserInfo) => Promise<ProviderResult>;
    update: (user: UserInfo) => Promise<ProviderResult>;
    loginWithEmail: (email: string, password: string) => Promise<ProviderResult>;

    hasPassword: () => Promise<ProviderResult>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<ProviderResult>;
    sendRecoveryEmail: (email: string) => Promise<ProviderResult>;
    changePasswordUsingHash: (recoveryHash: string, newPassword: string) => Promise<ProviderResult>; 

    search: (networkId: number, keyword: string, pageNum: number, profileId?: number) => Promise<ProviderResult>;
}

export default IUserProvider;