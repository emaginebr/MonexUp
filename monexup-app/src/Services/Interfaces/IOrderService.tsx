import OrderInfo from "../../DTO/Domain/OrderInfo";
import OrderListPagedResult from "../../DTO/Services/OrderListPagedResult";
import SubscriptionResult from "../../DTO/Services/SubscriptionResult";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IOrderService {
    init: (httpClient: IHttpClient) => void;
    createSubscription: (productSlug: string, token: string, networkSlug?: string, sellerSlug?: string) => Promise<ApiResponse<SubscriptionResult>>;
    createInvoice: (productSlug: string, token: string) => Promise<ApiResponse<SubscriptionResult>>;
    search: (networkId: number, userId: number, sellerId: number, pageNum: number, token: string) => Promise<ApiResponse<OrderListPagedResult>>;
    getById: (orderId: number, token: string) => Promise<ApiResponse<OrderInfo>>;
}
