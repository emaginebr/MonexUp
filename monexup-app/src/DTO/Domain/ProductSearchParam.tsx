export default interface ProductSearchParam {
    storeId?: number;
    userId?: number;
    networkSlug?: string;
    userSlug?: string;
    keyword?: string;
    onlyActive?: boolean;
    pageNum: number;
}
