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
    createPixPayment: async (productSlug: string, documentId: string, cellphone: string, networkSlug: string, sellerSlug: string, token: string, amount?: number) => {
        let ret: PixPaymentResult;
        const body = {
            networkSlug: networkSlug || null,
            productSlug,
            sellerSlug: sellerSlug || null,
            documentId,
            cellphone: cellphone || null,
            // Optional: open-amount donations pass the buyer-typed value so
            // backend can override product.Price. Omitted for fixed-price.
            amount: amount && amount > 0 ? amount : null,
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
    simulatePixPayment: async (proxyPayInvoiceId: number, token: string) => {
        // Dev-only: MonexUp proxies ProxyPay's simulate-payment. Browser never
        // touches ProxyPay directly.
        let request = await _httpClient.doPostAuth<any>("/Order/simulatePixPayment/" + proxyPayInvoiceId, {}, token);
        if (request.success) {
            return request.data;
        }
        return { sucesso: false, mensagem: request.messageError };
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
    },
    update: async (order: OrderInfo, token: string) => {
        return await _httpClient.doPostAuth<OrderInfo>("/Order/update", order, token);
    },
    listInvoices: async (orderId: number, token: string) => {
        return await _httpClient.doGetAuth<any[]>("/Order/listInvoices/" + orderId, token);
    },
    getInvoice: async (orderId: number, invoiceId: number, token: string) => {
        return await _httpClient.doGetAuth<any>("/Order/getInvoice/" + orderId + "/" + invoiceId, token);
    }
}

export default OrderService;
