import OrderInfo from "../Domain/OrderInfo";
import OrderListPagedInfo from "../Domain/OrderListPagedInfo";
import PixPaymentResult from "../Services/SubscriptionResult";
import OrderProviderResult from "./OrderProviderResult";
import ProviderResult from "./ProviderResult";


interface IOrderProvider {
    loading: boolean;
    loadingUpdate: boolean;
    loadingSearch: boolean;

    order: OrderInfo;
    searchResult: OrderListPagedInfo;
    pixPaymentResult: PixPaymentResult | null;

    createPixPayment: (productSlug: string, documentId: string, networkSlug?: string, sellerSlug?: string) => Promise<OrderProviderResult>;
    search: (networkId: number, userId: number, sellerId: number, pageNum: number) => Promise<ProviderResult>;
    getById: (orderId: number) => Promise<OrderProviderResult>;
}

export default IOrderProvider;
