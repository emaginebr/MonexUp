import OrderInfo from "../../DTO/Domain/OrderInfo";
import OrderListPagedResult from "../../DTO/Services/OrderListPagedResult";
import SubscriptionResult from "../../DTO/Services/SubscriptionResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IOrderService from "../Interfaces/IOrderService";

let _httpClient: IHttpClient;

const OrderService: IOrderService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    createSubscription: async (productSlug: string, token: string, networkSlug?: string, sellerSlug?: string) => {
        let url: string = "/Order/createSubscription/" + productSlug;
        if (networkSlug) {
            url += "?networkSlug=" + networkSlug;
        }
        if (sellerSlug) {
            url += "?sellerSlug=" + sellerSlug;
        }
        return await _httpClient.doGetAuth<SubscriptionResult>(url, token);
    },
    createInvoice: async (productSlug: string, token: string) => {
        return await _httpClient.doGetAuth<SubscriptionResult>("/Order/createInvoice/" + productSlug, token);
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
