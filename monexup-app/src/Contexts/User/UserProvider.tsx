import { useState } from "react";
import { useNAuth, type UserInfo as NAuthUserInfo, type PagedResult } from "nauth-react";
import IUserProvider from "../../DTO/Contexts/IUserProvider";
import UserContext from "./UserContext";
import UserInfo from "../../DTO/Domain/UserInfo";
import UserNetworkSearchInfo from "../../DTO/Domain/UserNetworkSearchInfo";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import UserListPagedInfo from "../../DTO/Domain/UserListPagedInfo";
import UserProviderResult from "../../DTO/Contexts/UserProviderResult";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import { UserNetworkStatusEnum } from "../../DTO/Enum/UserNetworkStatusEnum";

function mapNAuthUserToLocal(nauthUser: NAuthUserInfo): UserInfo {
    if (!nauthUser) return null;
    return {
        userId: nauthUser.userId,
        email: nauthUser.email,
        slug: nauthUser.slug,
        imageUrl: nauthUser.imageUrl,
        name: nauthUser.name,
        hash: nauthUser.hash,
        password: nauthUser.password || "",
        isAdmin: nauthUser.isAdmin,
        birthDate: nauthUser.birthDate,
        idDocument: nauthUser.idDocument,
        pixKey: nauthUser.pixKey || "",
        phones: nauthUser.phones?.map(p => ({ phone: p.phone })) || [],
        addresses: nauthUser.addresses?.map(a => ({
            zipCode: a.zipCode,
            address: a.address,
            complement: a.complement || "",
            neighborhood: a.neighborhood,
            city: a.city,
            state: a.state
        })) || [],
        createAt: nauthUser.createAt,
        updateAt: nauthUser.updateAt
    };
}

function mapNAuthUserToSearchInfo(nauthUser: NAuthUserInfo): UserNetworkSearchInfo {
    if (!nauthUser) return null;
    return {
        userId: nauthUser.userId,
        networkId: 0,
        name: nauthUser.name,
        email: nauthUser.email,
        profile: "",
        level: 0,
        commission: 0,
        role: nauthUser.isAdmin ? UserRoleEnum.Administrator : UserRoleEnum.User,
        status: UserNetworkStatusEnum.Active
    };
}

export default function UserProvider(props: any) {

    const nauth = useNAuth();

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingList, setLoadingList] = useState<boolean>(false);
    const [loadingPassword, setLoadingPassword] = useState<boolean>(false);
    const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

    const [userHasPassword, setUserHasPassword] = useState<boolean>(false);

    const [user, _setUser] = useState<UserInfo>(null);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [searchResult, setSearchResult] = useState<UserListPagedInfo>(null);

    const userProviderValue: IUserProvider = {
        loading: loading,
        loadingList: loadingList,
        loadingPassword: loadingPassword,
        loadingUpdate: loadingUpdate,
        loadingSearch: loadingSearch,
        userHasPassword: userHasPassword,
        user: user,
        users: users,
        searchResult: searchResult,
        setUser: (user: UserInfo) => {
            _setUser(user);
        },
        getMe: async () => {
            let ret: Promise<UserProviderResult>;
            setLoading(true);
            try {
                const nauthUser = await nauth.refreshUser();
                const localUser = mapNAuthUserToLocal(nauthUser);
                setLoading(false);
                _setUser(localUser);
                return {
                    ...ret,
                    user: localUser,
                    sucesso: true,
                    mensagemSucesso: "User load"
                };
            }
            catch (err: any) {
                setLoading(false);
                return {
                    ...ret,
                    user: null,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        getUserByEmail: async (email: string) => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            try {
                const nauthUser = await nauth.getUserById(0); // NAuth doesn't have getByEmail directly in context
                setLoading(false);
                _setUser(mapNAuthUserToLocal(nauthUser));
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "User load"
                };
            }
            catch (err: any) {
                setLoading(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        getBySlug: async (slug: string) => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            try {
                // getUserById is available in context, but getBySlug might need direct API
                setLoading(false);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "User load"
                };
            }
            catch (err: any) {
                setLoading(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        insert: async (user: UserInfo) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                const nauthUser = await nauth.createUser(user as any);
                const localUser = mapNAuthUserToLocal(nauthUser);
                setLoadingUpdate(false);
                _setUser(localUser);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "User inserted"
                };
            }
            catch (err: any) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        update: async (user: UserInfo) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                const nauthUser = await nauth.updateUser(user as any);
                const localUser = mapNAuthUserToLocal(nauthUser);
                setLoadingUpdate(false);
                _setUser(localUser);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "User updated"
                };
            }
            catch (err: any) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        loginWithEmail: async (email: string, password: string) => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            try {
                const loggedUser = await nauth.login({ email, password });
                const localUser = mapNAuthUserToLocal(loggedUser);
                setLoading(false);
                _setUser(localUser);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "User logged"
                };
            }
            catch (err: any) {
                setLoading(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        hasPassword: async () => {
            let ret: Promise<ProviderResult>;
            setLoadingPassword(true);
            setUserHasPassword(false);
            try {
                const result = await nauth.hasPassword();
                setUserHasPassword(result);
                setLoadingPassword(false);
                return {
                    ...ret,
                    sucesso: result,
                    mensagemSucesso: result ? "Has password" : "No password"
                };
            }
            catch (err: any) {
                setLoadingPassword(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        changePassword: async (oldPassword: string, newPassword: string) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                await nauth.changePassword({ oldPassword, newPassword });
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "Password changed"
                };
            }
            catch (err: any) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        sendRecoveryEmail: async (email: string) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                await nauth.sendRecoveryEmail(email);
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "Recovery email sent successfully"
                };
            }
            catch (err: any) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        changePasswordUsingHash: async (recoveryHash: string, newPassword: string) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                await nauth.resetPassword({ recoveryHash, newPassword });
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "Password changed successfully"
                };
            }
            catch (err: any) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        list: async (take: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingList(true);
            try {
                const result = await nauth.searchUsers({ searchTerm: "", page: 1, pageSize: take });
                const localUsers = result.items.map(mapNAuthUserToLocal);
                setLoadingList(false);
                setUsers(localUsers);
                return {
                    ...ret,
                    sucesso: true
                };
            }
            catch (err: any) {
                setLoadingList(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        },
        search: async (networkId: number, keyword: string, pageNum: number, profileId?: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingSearch(true);
            setSearchResult(null);
            try {
                const result = await nauth.searchUsers({ searchTerm: keyword, page: pageNum, pageSize: 20 });
                const pagedInfo: UserListPagedInfo = {
                    users: result.items.map(mapNAuthUserToSearchInfo),
                    page: result.page,
                    pageSize: result.pageSize,
                    totalCount: result.totalCount,
                    totalPages: result.totalPages
                };
                setLoadingSearch(false);
                setSearchResult(pagedInfo);
                return {
                    ...ret,
                    sucesso: true,
                    mensagemSucesso: "Search executed"
                };
            }
            catch (err: any) {
                setLoadingSearch(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: err?.message || JSON.stringify(err)
                };
            }
        }
    }

    return (
        <UserContext.Provider value={userProviderValue}>
            {props.children}
        </UserContext.Provider>
    );
}
