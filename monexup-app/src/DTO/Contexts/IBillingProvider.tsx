import BillingListItemInfo from "../Domain/BillingListItemInfo";
import EnsureStoreResponse from "../Domain/EnsureStoreResponse";
import InvoiceSearchParam from "../Domain/InvoiceSearchParam";
import ProviderResult from "./ProviderResult";

/** Envelope returned by BillingProvider.searchInvoices — mirrors OrderProvider.search
 *  but adds the paged invoice list inline so callers don't need a second read. */
export interface BillingSearchInvoicesResult extends ProviderResult {
  invoices: any[];
  pageNum: number;
  pageCount: number;
  totalCount: number;
}

interface IBillingProvider {
  loading: boolean;
  billings: BillingListItemInfo[];
  lastEnsuredStore: EnsureStoreResponse | null;

  ensureStore: (networkId: number) => Promise<ProviderResult>;
  list: (networkId: number, pageNum?: number, pageSize?: number) => Promise<ProviderResult>;
  searchInvoices: (param: InvoiceSearchParam) => Promise<BillingSearchInvoicesResult>;
}

export default IBillingProvider;
