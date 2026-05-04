import ProductLinkInfo from "../../DTO/Domain/ProductLinkInfo";
import ProductLinkInsertInfo from "../../DTO/Domain/ProductLinkInsertInfo";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IProductLinkService from "../Interfaces/IProductLinkService";

let _httpClient: IHttpClient;

const ProductLinkService: IProductLinkService = {
  init(httpClient: IHttpClient) {
    _httpClient = httpClient;
  },
  upsert(payload: ProductLinkInsertInfo, token: string) {
    return _httpClient.doPostAuth<ProductLinkInfo>("/ProductLink", payload, token);
  },
  listByNetwork(networkId: number, token: string) {
    return _httpClient.doGetAuth<ProductLinkInfo[]>(`/ProductLink/by-network/${networkId}`, token);
  },
  listByUser(userId: number, token: string) {
    return _httpClient.doGetAuth<ProductLinkInfo[]>(`/ProductLink/by-user/${userId}`, token);
  },
  deleteByNetwork(networkId: number, token: string) {
    return _httpClient.doDeleteAuth<unknown>(`/ProductLink/by-network/${networkId}`, token);
  },
};

export default ProductLinkService;
