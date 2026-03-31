import BusinessResult from "../../DTO/Business/BusinessResult";
import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductListPagedInfo from "../../DTO/Domain/ProductListPagedInfo";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import IProductService from "../../Services/Interfaces/IProductService";
import IProductBusiness from "../Interfaces/IProductBusiness";

let _productService: IProductService;

const ProductBusiness: IProductBusiness = {
    init: function (productService: IProductService): void {
        _productService = productService;
    },
    search: async (param: ProductSearchParam) => {
        let ret: BusinessResult<ProductListPagedInfo>;
        let retServ = await _productService.search(param);
        if (retServ.success) {
            let search: ProductListPagedInfo;
            search = {
                ...search,
                pageNum: retServ.data.pageNum,
                pageCount: retServ.data.pageCount,
                products: retServ.data.products
            };
            return { ...ret, dataResult: search, sucesso: true };
        } else {
            return { ...ret, sucesso: false, mensagem: retServ.messageError };
        }
    },
    getBySlug: async (productSlug: string) => {
        let ret: BusinessResult<ProductInfo>;
        let retServ = await _productService.getBySlug(productSlug);
        if (retServ.success) {
            return { ...ret, dataResult: retServ.data, sucesso: true };
        } else {
            return { ...ret, sucesso: false, mensagem: retServ.messageError };
        }
    }
}

export default ProductBusiness;
