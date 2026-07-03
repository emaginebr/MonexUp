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

    createPixPayment: (productSlug: string, documentId: string, cellphone: string, networkSlug?: string, sellerSlug?: string, amount?: number) => Promise<OrderProviderResult>;
    checkPixStatus: (invoiceId: number) => Promise<{ paid: boolean; status: string; sucesso: boolean }>;
    simulatePixPayment: (invoiceId: number) => Promise<{ sucesso: boolean; mensagem?: string }>;
    search: (networkId: number, userId: number, sellerId: number, pageNum: number) => Promise<ProviderResult>;
    getById: (orderId: number) => Promise<OrderProviderResult>;
    update: (order: OrderInfo) => Promise<OrderProviderResult>;
    listInvoices: (orderId: number) => Promise<{ sucesso: boolean; invoices: any[]; mensagemErro?: string }>;
    getInvoice: (orderId: number, invoiceId: number) => Promise<{ sucesso: boolean; invoice: any | null; mensagemErro?: string }>;
}

export default IOrderProvider;
