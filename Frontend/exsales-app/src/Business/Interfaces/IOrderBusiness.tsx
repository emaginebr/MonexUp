import BusinessResult from "../../DTO/Business/BusinessResult";
import IOrderService from "../../Services/Interfaces/IOrderService";

export default interface IOrderBusiness {
  init: (orderService: IOrderService) => void;
  createSubscription: (productSlug: string) => Promise<BusinessResult<string>>;
}