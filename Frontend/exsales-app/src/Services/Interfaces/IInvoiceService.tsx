import InvoiceListPagedResult from "../../DTO/Services/InvoiceListPagedResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IInvoiceService {
    init: (httpClient : IHttpClient) => void;
    search: (networkId: number, userId: number, sellerId: number, pageNum: number, token: string) => Promise<InvoiceListPagedResult>;
}