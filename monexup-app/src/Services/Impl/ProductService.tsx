import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import ProductListPagedResult from "../../DTO/Services/ProductListPagedResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IProductService from "../Interfaces/IProductService";

let _httpClient: IHttpClient;

const ProductService: IProductService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    insert: async (product: ProductInfo, token: string) => {
        return await _httpClient.doPostAuth<ProductInfo>("/Product/insert", product, token);
    },
    update: async (product: ProductInfo, token: string) => {
        return await _httpClient.doPostAuth<ProductInfo>("/Product/update", product, token);
    },
    search: async (param: ProductSearchParam, token: string) => {
        return await _httpClient.doPostAuth<ProductListPagedResult>("/Product/search", param, token);
    },
    listByNetwork: async (networkId: number) => {
        return await _httpClient.doGet<ProductInfo[]>("/Product/listByNetwork/" + networkId, {});
    },
    listByNetworkSlug: async (networkSlug: string) => {
        return await _httpClient.doGet<ProductInfo[]>("/Product/listByNetworkSlug/" + networkSlug, {});
    },
    getById: async (productId: number, token: string) => {
        return await _httpClient.doGetAuth<ProductInfo>("/Product/getById/" + productId, token);
    },
    getBySlug: async (productSlug: string) => {
        return await _httpClient.doGet<ProductInfo>("/Product/getBySlug/" + productSlug, {});
    }
}

export default ProductService;
