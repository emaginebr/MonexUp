import BusinessResult from "../../DTO/Business/BusinessResult";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import OrderListPagedInfo from "../../DTO/Domain/OrderListPagedInfo";
import PixPaymentResult from "../../DTO/Services/SubscriptionResult";
import IOrderService from "../../Services/Interfaces/IOrderService";

export default interface IOrderBusiness {
  init: (orderService: IOrderService) => void;
  createPixPayment: (productSlug: string, documentId: string, networkSlug?: string, sellerSlug?: string) => Promise<BusinessResult<PixPaymentResult>>;
  search: (networkId: number, userId: number, sellerId: number, pageNum: number) => Promise<BusinessResult<OrderListPagedInfo>>;
  getById: (orderId: number) => Promise<BusinessResult<OrderInfo>>;
}
