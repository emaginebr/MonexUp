import BillingListItemInfo from "../Domain/BillingListItemInfo";
import EnsureStoreResponse from "../Domain/EnsureStoreResponse";
import ProviderResult from "./ProviderResult";

interface IBillingProvider {
  loading: boolean;
  billings: BillingListItemInfo[];
  lastEnsuredStore: EnsureStoreResponse | null;

  ensureStore: (networkId: number) => Promise<ProviderResult>;
  list: (networkId: number, pageNum?: number, pageSize?: number) => Promise<ProviderResult>;
}

export default IBillingProvider;
