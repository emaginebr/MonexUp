import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import ProductListPagedResult from "../../DTO/Services/ProductListPagedResult";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IProductService {
    init: (httpClient: IHttpClient) => void;
    insert: (profile: ProductInfo, token: string) => Promise<ApiResponse<ProductInfo>>;
    update: (profile: ProductInfo, token: string) => Promise<ApiResponse<ProductInfo>>;
    search: (param: ProductSearchParam, token: string) => Promise<ApiResponse<ProductListPagedResult>>;
    listByNetwork: (networkId: number) => Promise<ApiResponse<ProductInfo[]>>;
    listByNetworkSlug: (networkSlug: string) => Promise<ApiResponse<ProductInfo[]>>;
    getById: (productId: number, token: string) => Promise<ApiResponse<ProductInfo>>;
    getBySlug: (productSlug: string) => Promise<ApiResponse<ProductInfo>>;
}
