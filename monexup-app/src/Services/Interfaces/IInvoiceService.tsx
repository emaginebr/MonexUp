import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import StatementListPagedResult from "../../DTO/Services/StatementListPagedResult";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IInvoiceService {
    init: (httpClient: IHttpClient) => void;
    searchStatement: (param: StatementSearchParam, token: string) => Promise<ApiResponse<StatementListPagedResult>>;
    getBalance: (token: string, networkId?: number) => Promise<ApiResponse<number>>;
    getAvailableBalance: (token: string) => Promise<ApiResponse<number>>;
}
