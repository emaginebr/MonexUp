import ProductInfo from "../Domain/ProductInfo";
import ProductListPagedInfo from "../Domain/ProductListPagedInfo";
import ProductSearchParam from "../Domain/ProductSearchParam";
import ProductProviderResult from "./ProductProviderResult";
import ProviderResult from "./ProviderResult";

interface IProductProvider {
    loading: boolean;
    loadingSearch: boolean;

    product: ProductInfo;
    searchResult: ProductListPagedInfo;

    setProduct: (product: ProductInfo) => void;

    search: (param: ProductSearchParam) => Promise<ProviderResult>;
    getBySlug: (productSlug: string) => Promise<ProductProviderResult>;
}

export default IProductProvider;
