import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import INetworkService from "../Interfaces/INetworkService";

let _httpClient: IHttpClient;

const NetworkService: INetworkService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    insert: async (network: NetworkInsertInfo, token: string) => {
        return await _httpClient.doPostAuth<NetworkInfo>("/Network/insert", network, token);
    },
    update: async (network: NetworkInfo, token: string) => {
        return await _httpClient.doPostAuth<NetworkInfo>("/Network/update", network, token);
    },
    listAll: async () => {
        return await _httpClient.doGet<NetworkInfo[]>("/Network/listAll", {});
    },
    listByUser: async (token: string) => {
        return await _httpClient.doGetAuth<UserNetworkInfo[]>("/Network/listByUser", token);
    },
    listByNetwork: async (networkSlug: string) => {
        return await _httpClient.doGet<UserNetworkInfo[]>("/Network/listByNetwork/" + networkSlug, {});
    },
    getById: async (networkId: number, token: string) => {
        return await _httpClient.doGetAuth<NetworkInfo>("/Network/getById/" + networkId, token);
    },
    getBySlug: async (networkSlug: string) => {
        return await _httpClient.doGet<NetworkInfo>("/Network/getBySlug/" + networkSlug, {});
    },
    getUserNetwork: async (networkId: number, token: string) => {
        return await _httpClient.doGetAuth<UserNetworkInfo>("/Network/getUserNetwork/" + networkId, token);
    },
    getUserNetworkBySlug: async (networkSlug: string, token: string) => {
        return await _httpClient.doGetAuth<UserNetworkInfo>("/Network/getUserNetworkBySlug/" + networkSlug, token);
    },
    getSellerBySlug: async (networkSlug: string, userSlug: string) => {
        return await _httpClient.doGet<UserNetworkInfo>("/Network/getSellerBySlug/" + networkSlug + "/" + userSlug, {});
    },
    requestAccess: async (networkId: number, token: string, referrerId?: number) => {
        return await _httpClient.doPostAuth<void>("/Network/requestAccess", {
            networkId: networkId,
            referrerId: referrerId
        }, token);
    },
    changeStatus: async (networkId: number, userId: number, status: number, token: string) => {
        return await _httpClient.doPostAuth<void>("/Network/changeStatus", {
            networkId: networkId,
            userId: userId,
            status: status
        }, token);
    },
    promote: async (networkId: number, userId: number, token: string) => {
        return await _httpClient.doGetAuth<void>("/Network/promote/" + networkId + "/" + userId, token);
    },
    demote: async (networkId: number, userId: number, token: string) => {
        return await _httpClient.doGetAuth<void>("/Network/demote/" + networkId + "/" + userId, token);
    },
}

export default NetworkService;
