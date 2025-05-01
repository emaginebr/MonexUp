import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import ProductListPagedResult from "../../DTO/Services/ProductListPagedResult";
import ProductListResult from "../../DTO/Services/ProductListResult";
import ProductResult from "../../DTO/Services/ProductResult";
import IHttpClient from "../../Infra/Interface/IHttpClient"; 
import IProductService from "../Interfaces/IProductService";

let _httpClient : IHttpClient;

const ProductService : IProductService = {
    init: function (htppClient: IHttpClient): void {
        _httpClient = htppClient;
    },
    insert: async (product: ProductInfo, token: string) => {
        let ret: ProductResult;
        let request = await _httpClient.doPostAuth<ProductResult>("api/Product/insert", product, token);
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    update: async (product: ProductInfo, token: string) => {
        let ret: ProductResult;
        let request = await _httpClient.doPostAuth<ProductResult>("api/Product/update", product, token);
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    search: async (networkId: number, keyword: string, pageNum: number, token: string) => {
        let ret: ProductListPagedResult;
        let param: ProductSearchParam;
        param = {
            ...param,
            networkId: networkId,
            keyword: keyword,
            pageNum: pageNum
        };
        let request = await _httpClient.doPostAuth<ProductListPagedResult>("/api/Product/search", param, token);
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    listByNetwork: async (networkId: number) => {
        let ret: ProductListResult;
        let request = await _httpClient.doGet<ProductListResult>("/api/Product/listByNetwork/" + networkId, {});
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    listByNetworkSlug: async (networkSlug: string) => {
        let ret: ProductListResult;
        let request = await _httpClient.doGet<ProductListResult>("/api/Product/listByNetworkSlug/" + networkSlug, {});
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    getById: async (productId: number, token: string) => {
        let ret: ProductResult;
        let request = await _httpClient.doGetAuth<ProductResult>("/api/Product/getById/" + productId, token);
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    },
    getBySlug: async (productSlug: string) => {
        let ret: ProductResult;
        let request = await _httpClient.doGet<ProductResult>("/api/Product/getBySlug/" + productSlug, {});
        if (request.success) {
            return request.data;
        }
        else {
            ret = {
                mensagem: request.messageError,
                sucesso: false,
                ...ret
            };
        }
        return ret;
    }
}

export default ProductService;