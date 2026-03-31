import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import ProductListPagedResult from "../../DTO/Services/ProductListPagedResult";
import IHttpClient from "../../Infra/Interface/IHttpClient";
import IProductService from "../Interfaces/IProductService";
import ApiResponse from "../../DTO/Services/ApiResponse";

let _httpClient: IHttpClient;

const GRAPHQL_QUERY_PRODUCT_BY_SLUG = `
query($slug: String!) {
    getProducts(where: { slug: { eq: $slug } }) {
        items {
            productId storeId categoryId slug name description
            price discount frequency limit status productType featured
            images { imageId productId image imageUrl sortOrder }
        }
    }
}`;

const ProductService: IProductService = {
    init: function (httpClient: IHttpClient): void {
        _httpClient = httpClient;
    },
    search: async (param: ProductSearchParam) => {
        return await _httpClient.doPost<ProductListPagedResult>("/product/search", param);
    },
    getBySlug: async (productSlug: string) => {
        let ret: ApiResponse<ProductInfo>;
        let response = await _httpClient.doPost<any>("/graphql", {
            query: GRAPHQL_QUERY_PRODUCT_BY_SLUG,
            variables: { slug: productSlug }
        });
        if (response.success && response.data?.data?.getProducts?.items?.length > 0) {
            const product = response.data.data.getProducts.items[0];
            return {
                ...ret,
                data: product as ProductInfo,
                httpStatus: response.httpStatus,
                success: true
            };
        }
        return {
            ...ret,
            success: false,
            httpStatus: response.httpStatus,
            messageError: response.messageError || "Product not found"
        };
    }
}

export default ProductService;
