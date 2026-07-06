import { InviteDetailInfo, InviteResultInfo } from "../../DTO/Domain/InviteInfo";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IInviteService {
    init: (httpClient: IHttpClient) => void;
    invite: (networkId: number, email: string, token: string) => Promise<ApiResponse<InviteResultInfo>>;
    join: (token: string, authToken: string) => Promise<ApiResponse<void>>;
    getDetail: (token: string, authToken: string) => Promise<ApiResponse<InviteDetailInfo>>;
    accept: (token: string, authToken: string) => Promise<ApiResponse<void>>;
    decline: (token: string, authToken: string) => Promise<ApiResponse<void>>;
}
