import OrderInfo from "../../DTO/Domain/OrderInfo";
import OrderListPagedResult from "../../DTO/Services/OrderListPagedResult";
import PixPaymentResult from "../../DTO/Services/SubscriptionResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IOrderService from "../Interfaces/IOrderService";

let _httpClient: IHttpClient;

const OrderService: IOrderService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    createPixPayment: async (productSlug: string, documentId: string, networkSlug: string, sellerSlug: string, token: string) => {
        let ret: PixPaymentResult;
        const body = {
            networkSlug: networkSlug || null,
            productSlug,
            sellerSlug: sellerSlug || null,
            documentId,
        };
        let request = await _httpClient.doPostAuth<PixPaymentResult>("/Order/createPixPayment", body, token);
        if (request.success) {
            return request.data;
        } else {
            ret = { sucesso: false, mensagem: request.messageError } as PixPaymentResult;
        }
        return ret;
    },
    checkPixStatus: async (proxyPayInvoiceId: string, token: string) => {
        let request = await _httpClient.doGetAuth<any>("/Order/checkPixStatus/" + proxyPayInvoiceId, token);
        if (request.success) {
            return request.data;
        }
        return { sucesso: false, status: "ERROR", paid: false };
    },
    search: async (networkId: number, userId: number, sellerId: number, pageNum: number, token: string) => {
        return await _httpClient.doPostAuth<OrderListPagedResult>("/Order/search", {
            networkId: networkId,
            userId: userId,
            sellerId: sellerId,
            pageNum: pageNum
        }, token);
    },
    getById: async (orderId: number, token: string) => {
        return await _httpClient.doGetAuth<OrderInfo>("/Order/getById/" + orderId, token);
    }
}

export default OrderService;
