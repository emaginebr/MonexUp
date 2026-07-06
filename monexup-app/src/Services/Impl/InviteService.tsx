import { InviteDetailInfo, InviteResultInfo } from "../../DTO/Domain/InviteInfo";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IInviteService from "../Interfaces/IInviteService";

let _httpClient: IHttpClient;

const InviteService: IInviteService = {
    init: function (httpClient: IHttpClient): void {
        _httpClient = httpClient;
    },
    invite: async (networkId: number, email: string, token: string) => {
        return await _httpClient.doPostAuth<InviteResultInfo>("/Network/invite", {
            networkId: networkId,
            email: email
        }, token);
    },
    join: async (token: string, authToken: string) => {
        return await _httpClient.doPostAuth<void>("/Network/invite/join", {
            token: token
        }, authToken);
    },
    getDetail: async (token: string, authToken: string) => {
        return await _httpClient.doGetAuth<InviteDetailInfo>("/Network/invite/detail?token=" + encodeURIComponent(token), authToken);
    },
    accept: async (token: string, authToken: string) => {
        return await _httpClient.doPostAuth<void>("/Network/invite/accept", {
            token: token
        }, authToken);
    },
    decline: async (token: string, authToken: string) => {
        return await _httpClient.doPostAuth<void>("/Network/invite/decline", {
            token: token
        }, authToken);
    },
}

export default InviteService;
