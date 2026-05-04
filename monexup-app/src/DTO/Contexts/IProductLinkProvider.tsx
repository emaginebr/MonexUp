import ProductLinkInfo from "../Domain/ProductLinkInfo";
import ProviderResult from "./ProviderResult";

interface IProductLinkProvider {
  loading: boolean;
  links: ProductLinkInfo[];
  lastLink: ProductLinkInfo | null;

  upsert: (lofnProductId: number, networkId: number, userId: number) => Promise<ProviderResult>;
  listByNetwork: (networkId: number) => Promise<ProviderResult>;
  listByUser: (userId: number) => Promise<ProviderResult>;
  deleteByNetwork: (networkId: number) => Promise<ProviderResult>;
}

export default IProductLinkProvider;
