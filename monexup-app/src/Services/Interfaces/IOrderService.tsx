import OrderInfo from "../../DTO/Domain/OrderInfo";
import OrderListPagedResult from "../../DTO/Services/OrderListPagedResult";
import PixPaymentResult from "../../DTO/Services/SubscriptionResult";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IOrderService {
    init: (httpClient: IHttpClient) => void;
    createPixPayment: (productSlug: string, documentId: string, networkSlug: string, sellerSlug: string, token: string) => Promise<PixPaymentResult>;
    checkPixStatus: (proxyPayInvoiceId: string, token: string) => Promise<any>;
    search: (networkId: number, userId: number, sellerId: number, pageNum: number, token: string) => Promise<ApiResponse<OrderListPagedResult>>;
    getById: (orderId: number, token: string) => Promise<ApiResponse<OrderInfo>>;
}
