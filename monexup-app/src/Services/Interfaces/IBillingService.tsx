import BillingListItemInfo from "../../DTO/Domain/BillingListItemInfo";
import EnsureStoreResponse from "../../DTO/Domain/EnsureStoreResponse";
import InvoiceSearchParam from "../../DTO/Domain/InvoiceSearchParam";
import ApiResponse from "../../DTO/Services/ApiResponse";
import InvoiceListPagedResult from "../../DTO/Services/InvoiceListPagedResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IBillingService {
  init: (httpClient: IHttpClient) => void;
  ensureStore: (networkId: number, token: string) => Promise<ApiResponse<EnsureStoreResponse>>;
  list: (networkId: number, pageNum: number, pageSize: number, token: string) => Promise<ApiResponse<BillingListItemInfo[]>>;
  searchInvoices: (param: InvoiceSearchParam, token: string) => Promise<ApiResponse<InvoiceListPagedResult>>;
}
