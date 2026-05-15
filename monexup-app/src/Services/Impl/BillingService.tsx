import BillingListItemInfo from "../../DTO/Domain/BillingListItemInfo";
import EnsureStoreResponse from "../../DTO/Domain/EnsureStoreResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IBillingService from "../Interfaces/IBillingService";

let _httpClient: IHttpClient;

const BillingService: IBillingService = {
  init(httpClient: IHttpClient) {
    _httpClient = httpClient;
  },
  ensureStore(networkId: number, token: string) {
    return _httpClient.doPostAuth<EnsureStoreResponse>("/Network/ensure-store", { networkId }, token);
  },
  list(networkId: number, pageNum: number, pageSize: number, token: string) {
    return _httpClient.doGetAuth<BillingListItemInfo[]>(
      `/Billing/list?networkId=${networkId}&pageNum=${pageNum}&pageSize=${pageSize}`,
      token
    );
  },
};

export default BillingService;
