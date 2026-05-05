import BusinessResult from "../../DTO/Business/BusinessResult";
import BillingListItemInfo from "../../DTO/Domain/BillingListItemInfo";
import EnsureStoreResponse from "../../DTO/Domain/EnsureStoreResponse";
import IBillingService from "../../Services/Interfaces/IBillingService";

export default interface IBillingBusiness {
  init: (service: IBillingService) => void;
  ensureStore: (networkId: number) => Promise<BusinessResult<EnsureStoreResponse>>;
  list: (networkId: number, pageNum?: number, pageSize?: number) => Promise<BusinessResult<BillingListItemInfo[]>>;
}
