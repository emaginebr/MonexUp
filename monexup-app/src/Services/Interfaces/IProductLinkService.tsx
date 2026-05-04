import ProductLinkInfo from "../../DTO/Domain/ProductLinkInfo";
import ProductLinkInsertInfo from "../../DTO/Domain/ProductLinkInsertInfo";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IProductLinkService {
  init: (httpClient: IHttpClient) => void;
  upsert: (payload: ProductLinkInsertInfo, token: string) => Promise<ApiResponse<ProductLinkInfo>>;
  listByNetwork: (networkId: number, token: string) => Promise<ApiResponse<ProductLinkInfo[]>>;
  listByUser: (userId: number, token: string) => Promise<ApiResponse<ProductLinkInfo[]>>;
  deleteByNetwork: (networkId: number, token: string) => Promise<ApiResponse<unknown>>;
}
