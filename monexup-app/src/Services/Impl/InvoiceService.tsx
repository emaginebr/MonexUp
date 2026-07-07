import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import StatementListPagedResult from "../../DTO/Services/StatementListPagedResult";
import MemberBalanceInfo from "../../DTO/Domain/MemberBalanceInfo";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IInvoiceService from "../Interfaces/IInvoiceService";

let _httpClient: IHttpClient;

const InvoiceService: IInvoiceService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    searchStatement: async (param: StatementSearchParam, token: string) => {
        return await _httpClient.doPostAuth<StatementListPagedResult>("/Billing/searchStatement", param, token);
    },
    getBalance: async (token: string, networkId?: number) => {
        let url: string = "/Billing/getBalance" + ((networkId) ? "?networkId=" + networkId : "");
        return await _httpClient.doGetAuth<number>(url, token);
    },
    getAvailableBalance: async (token: string) => {
        return await _httpClient.doGetAuth<number>("/Billing/getAvailableBalance", token);
    },
    getMyBalance: async (networkId: number, token: string) => {
        return await _httpClient.doGetAuth<MemberBalanceInfo>("/Billing/my-balance/" + networkId, token);
    },
    getNetworkBalance: async (networkId: number, token: string) => {
        return await _httpClient.doGetAuth<MemberBalanceInfo>("/Billing/network-balance/" + networkId, token);
    }
}

export default InvoiceService;
