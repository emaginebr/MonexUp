import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import OrderListPagedInfo from "../../DTO/Domain/OrderListPagedInfo";
import PixPaymentResult from "../../DTO/Services/SubscriptionResult";
import IOrderService from "../../Services/Interfaces/IOrderService";
import AuthFactory from "../Factory/AuthFactory";
import IOrderBusiness from "../Interfaces/IOrderBusiness";

let _orderService: IOrderService;

const OrderBusiness: IOrderBusiness = {
  init: function (orderService: IOrderService): void {
    _orderService = orderService;
  },
  createPixPayment: async (productSlug: string, documentId: string, networkSlug?: string, sellerSlug?: string) => {
    try {
        let ret: BusinessResult<PixPaymentResult>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
          return {
            ...ret,
            sucesso: false,
            mensagem: "Not logged"
          };
        }
        let retServ = await _orderService.createPixPayment(productSlug, documentId, networkSlug, sellerSlug, session.token);
        return {
          ...ret,
          dataResult: retServ,
          sucesso: retServ.sucesso !== false
        };
      } catch {
        throw new Error("Failed to create PIX payment");
      }
  },
  search: async (networkId: number, userId: number, sellerId: number, pageNum: number) => {
    try {
      let ret: BusinessResult<OrderListPagedInfo>;
      let session: AuthSession = AuthFactory.AuthBusiness.getSession();
      if (!session) {
        return {
          ...ret,
          sucesso: false,
          mensagem: "Not logged"
        };
      }
      let retServ = await _orderService.search(networkId, userId, sellerId, pageNum, session.token);
      if (retServ.success) {
        let orderPaged: OrderListPagedInfo;
        orderPaged = {
          ...orderPaged,
          orders: retServ.data.orders,
          pageNum: retServ.data.pageNum,
          pageCount: retServ.data.pageCount
        }
        return {
          ...ret,
          dataResult: orderPaged,
          sucesso: true
        };
      } else {
        return {
          ...ret,
          sucesso: false,
          mensagem: retServ.messageError
        };
      }
    } catch {
      throw new Error("Failed to get user by email");
    }
  },
  getById: async (orderId: number) => {
    try {
      let ret: BusinessResult<OrderInfo>;
      let session: AuthSession = AuthFactory.AuthBusiness.getSession();
      if (!session) {
        return {
          ...ret,
          sucesso: false,
          mensagem: "Not logged"
        };
      }
      let retServ = await _orderService.getById(orderId, session.token);
      if (retServ.success) {
        return {
          ...ret,
          dataResult: retServ.data,
          sucesso: true
        };
      } else {
        return {
          ...ret,
          sucesso: false,
          mensagem: retServ.messageError
        };
      }
    } catch {
      throw new Error("Failed to get user by email");
    }
  }
}

export default OrderBusiness;
