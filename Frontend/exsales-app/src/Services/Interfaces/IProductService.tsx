import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductListPagedResult from "../../DTO/Services/ProductListPagedResult";
import ProductResult from "../../DTO/Services/ProductResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";

export default interface IProductService {
    init: (httpClient : IHttpClient) => void;
    insert: (profile: ProductInfo, token: string) => Promise<ProductResult>;
    update: (profile: ProductInfo, token: string) => Promise<ProductResult>;
    search: (networkId: number, keyword: string, pageNum: number, token: string) => Promise<ProductListPagedResult>;
    getById: (productId: number, token: string) => Promise<ProductResult>;
}