import ProductInfo from "../Domain/ProductInfo";

export default interface ProductListPagedResult {
    products: ProductInfo[];
    pageNum: number;
    pageCount: number;
  }
