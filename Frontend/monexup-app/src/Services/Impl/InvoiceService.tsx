import InvoiceListPagedResult from "../../DTO/Services/InvoiceListPagedResult";
import IHttpClient from "../../Infra/Interface/IHttpClient"; 
import IInvoiceService from "../Interfaces/IInvoiceService";

let _httpClient : IHttpClient;

const InvoiceService : IInvoiceService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    search: async (networkId: number, userId: number, sellerId: number, pageNum: number, token: string) => {
        let ret: InvoiceListPagedResult;
        let request = await _httpClient.doPostAuth<InvoiceListPagedResult>("/api/Invoice/search", {
            networkId: networkId,
            userId: userId,
            sellerId: sellerId,
            pageNum: pageNum
        }, token);
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    }
}

export default InvoiceService;