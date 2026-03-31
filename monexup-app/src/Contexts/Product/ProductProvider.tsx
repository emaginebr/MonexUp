import { useState } from "react";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import IProductProvider from "../../DTO/Contexts/IProductProvider";
import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductListPagedInfo from "../../DTO/Domain/ProductListPagedInfo";
import ProductFactory from "../../Business/Factory/ProductFactory";
import ProductContext from "./ProductContext";
import ProductProviderResult from "../../DTO/Contexts/ProductProviderResult";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";

export default function ProductProvider(props: any) {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

    const [product, _setProduct] = useState<ProductInfo>(null);
    const [searchResult, setSearchResult] = useState<ProductListPagedInfo>(null);

    const productProviderValue: IProductProvider = {
        loading: loading,
        loadingSearch: loadingSearch,

        product: product,
        searchResult: searchResult,

        setProduct: (product: ProductInfo) => {
            _setProduct(product);
        },

        search: async (param: ProductSearchParam) => {
            let ret: Promise<ProviderResult>;
            setLoadingSearch(true);
            setSearchResult(null);
            let brt = await ProductFactory.ProductBusiness.search(param);
            setLoadingSearch(false);
            if (brt.sucesso) {
                setSearchResult(brt.dataResult);
                return { ...ret, sucesso: true, mensagemSucesso: "Search complete" };
            } else {
                return { ...ret, sucesso: false, mensagemErro: brt.mensagem };
            }
        },
        getBySlug: async (productSlug: string) => {
            let ret: Promise<ProductProviderResult>;
            setLoading(true);
            _setProduct(null);
            let brt = await ProductFactory.ProductBusiness.getBySlug(productSlug);
            setLoading(false);
            if (brt.sucesso) {
                _setProduct(brt.dataResult);
                return { ...ret, product: brt.dataResult, sucesso: true, mensagemSucesso: "Product loaded" };
            } else {
                return { ...ret, sucesso: false, mensagemErro: brt.mensagem };
            }
        }
    }

    return (
        <ProductContext.Provider value={productProviderValue}>
            {props.children}
        </ProductContext.Provider>
    );
}
