import BusinessResult from "../../DTO/Business/BusinessResult";
import ProductInfo from "../../DTO/Domain/ProductInfo";
import ProductListPagedInfo from "../../DTO/Domain/ProductListPagedInfo";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import IProductService from "../../Services/Interfaces/IProductService";

export default interface IProductBusiness {
    init: (productService: IProductService) => void;
    search: (param: ProductSearchParam) => Promise<BusinessResult<ProductListPagedInfo>>;
    getBySlug: (productSlug: string) => Promise<BusinessResult<ProductInfo>>;
}
