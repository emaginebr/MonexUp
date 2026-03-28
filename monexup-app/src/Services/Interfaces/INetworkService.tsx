import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface INetworkService {
    init: (httpClient: IHttpClient) => void;
    insert: (network: NetworkInsertInfo, token: string) => Promise<ApiResponse<NetworkInfo>>;
    update: (network: NetworkInfo, token: string) => Promise<ApiResponse<NetworkInfo>>;
    listAll: () => Promise<ApiResponse<NetworkInfo[]>>;
    listByUser: (token: string) => Promise<ApiResponse<UserNetworkInfo[]>>;
    listByNetwork: (networkSlug: string) => Promise<ApiResponse<UserNetworkInfo[]>>;
    getById: (networkId: number, token: string) => Promise<ApiResponse<NetworkInfo>>;
    getBySlug: (networkSlug: string) => Promise<ApiResponse<NetworkInfo>>;
    getUserNetwork: (networkId: number, token: string) => Promise<ApiResponse<UserNetworkInfo>>;
    getUserNetworkBySlug: (networkSlug: string, token: string) => Promise<ApiResponse<UserNetworkInfo>>;
    getSellerBySlug: (networkSlug: string, userSlug: string) => Promise<ApiResponse<UserNetworkInfo>>;
    requestAccess: (networkId: number, token: string, referrerId?: number) => Promise<ApiResponse<void>>;
    changeStatus: (networkId: number, userId: number, status: number, token: string) => Promise<ApiResponse<void>>;
    promote: (networkId: number, userId: number, token: string) => Promise<ApiResponse<void>>;
    demote: (networkId: number, userId: number, token: string) => Promise<ApiResponse<void>>;
}
