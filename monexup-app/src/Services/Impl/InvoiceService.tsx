import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import InvoiceInfo from "../../DTO/Domain/InvoiceInfo";
import InvoiceListPagedResult from "../../DTO/Services/InvoiceListPagedResult";
import StatementListPagedResult from "../../DTO/Services/StatementListPagedResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IInvoiceService from "../Interfaces/IInvoiceService";

let _httpClient: IHttpClient;

const InvoiceService: IInvoiceService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    search: async (networkId: number, userId: number, sellerId: number, pageNum: number, token: string) => {
        return await _httpClient.doPostAuth<InvoiceListPagedResult>("/Invoice/search", {
            networkId: networkId,
            userId: userId,
            sellerId: sellerId,
            pageNum: pageNum
        }, token);
    },
    searchStatement: async (param: StatementSearchParam, token: string) => {
        return await _httpClient.doPostAuth<StatementListPagedResult>("/Invoice/searchStatement", param, token);
    },
    getBalance: async (token: string, networkId?: number) => {
        let url: string = "/Invoice/getBalance" + ((networkId) ? "?networkId=" + networkId : "");
        return await _httpClient.doGetAuth<number>(url, token);
    },
    getAvailableBalance: async (token: string) => {
        return await _httpClient.doGetAuth<number>("/Invoice/getAvailableBalance", token);
    },
    syncronize: async (token: string) => {
        return await _httpClient.doGetAuth<void>("/Invoice/syncronize", token);
    },
    checkout: async (checkoutSessionId: string) => {
        return await _httpClient.doGet<InvoiceInfo>("/Invoice/checkout/" + checkoutSessionId, {});
    }
}

export default InvoiceService;
