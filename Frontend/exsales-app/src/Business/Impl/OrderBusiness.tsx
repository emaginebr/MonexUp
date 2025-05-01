import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import IOrderService from "../../Services/Interfaces/IOrderService";
import AuthFactory from "../Factory/AuthFactory";
import IOrderBusiness from "../Interfaces/IOrderBusiness";

let _orderService: IOrderService;

const OrderBusiness: IOrderBusiness = {
  init: function (orderService: IOrderService): void {
    _orderService = orderService;
  },
  createSubscription: async (productSlug: string) => {
    try {
        let ret: BusinessResult<string>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
          return {
            ...ret,
            sucesso: false,
            mensagem: "Not logged"
          };
        }
        let retServ = await _orderService.createSubscription(productSlug, session.token);
        if (retServ.sucesso) {
          return {
            ...ret,
            dataResult: retServ.clientSecret,
            sucesso: true
          };
        } else {
          return {
            ...ret,
            sucesso: false,
            mensagem: retServ.mensagem
          };
        }
      } catch {
        throw new Error("Failed to get user by email");
      }
  }
}

export default OrderBusiness;