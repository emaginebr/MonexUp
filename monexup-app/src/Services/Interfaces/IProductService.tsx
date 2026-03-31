import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import ProductListPagedResult from "../../DTO/Services/ProductListPagedResult";
import ApiResponse from "../../DTO/Services/ApiResponse";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IProductService {
    init: (httpClient: IHttpClient) => void;
    search: (param: ProductSearchParam) => Promise<ApiResponse<ProductListPagedResult>>;
    getBySlug: (productSlug: string) => Promise<ApiResponse<ProductInfo>>;
}
