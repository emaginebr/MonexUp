import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";
import NetworkResult from "../../DTO/Services/NetworkResult";
import StatusRequest from "../../DTO/Services/StatusRequest";
import UserNetworkListResult from "../../DTO/Services/UserNetworkListResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";


export default interface INetworkService {
    init: (httpClient : IHttpClient) => void;
    insert: (network: NetworkInsertInfo, token: string) => Promise<NetworkResult>;
    update: (network: NetworkInfo, token: string) => Promise<NetworkResult>;
    listByUser: (token: string) => Promise<UserNetworkListResult>;
    getById: (networkId: number, token: string) => Promise<NetworkResult>;
    requestAccess: (networkId: number, referrerId?: number) => Promise<StatusRequest>;
    changeStatus: (networkId: number, userId: number, status: number, token: string) => Promise<StatusRequest>;
}