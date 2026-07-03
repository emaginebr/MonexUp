import BusinessResult from "../../DTO/Business/BusinessResult";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import OrderListPagedInfo from "../../DTO/Domain/OrderListPagedInfo";
import PixPaymentResult from "../../DTO/Services/SubscriptionResult";
import IOrderService from "../../Services/Interfaces/IOrderService";

export default interface IOrderBusiness {
  init: (orderService: IOrderService) => void;
  createPixPayment: (productSlug: string, documentId: string, cellphone: string, networkSlug?: string, sellerSlug?: string, amount?: number) => Promise<BusinessResult<PixPaymentResult>>;
  checkPixStatus: (invoiceId: number) => Promise<{ paid: boolean; status: string; sucesso: boolean }>;
  simulatePixPayment: (invoiceId: number) => Promise<{ sucesso: boolean; mensagem?: string }>;
  search: (networkId: number, userId: number, sellerId: number, pageNum: number) => Promise<BusinessResult<OrderListPagedInfo>>;
  getById: (orderId: number) => Promise<BusinessResult<OrderInfo>>;
  update: (order: OrderInfo) => Promise<BusinessResult<OrderInfo>>;
  listInvoices: (orderId: number) => Promise<BusinessResult<any[]>>;
  getInvoice: (orderId: number, invoiceId: number) => Promise<BusinessResult<any>>;
}
