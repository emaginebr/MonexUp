import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import InvoiceInfo from "../../DTO/Domain/InvoiceInfo";
import InvoiceListPagedResult from "../../DTO/Services/InvoiceListPagedResult";
import StatementListPagedResult from "../../DTO/Services/StatementListPagedResult";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IInvoiceService {
    init: (httpClient: IHttpClient) => void;
    search: (networkId: number, userId: number, sellerId: number, pageNum: number, token: string) => Promise<ApiResponse<InvoiceListPagedResult>>;
    searchStatement: (param: StatementSearchParam, token: string) => Promise<ApiResponse<StatementListPagedResult>>;
    getBalance: (token: string, networkId?: number) => Promise<ApiResponse<number>>;
    getAvailableBalance: (token: string) => Promise<ApiResponse<number>>;
    syncronize: (token: string) => Promise<ApiResponse<void>>;
    checkout: (checkoutSessionId: string) => Promise<ApiResponse<InvoiceInfo>>;
}
