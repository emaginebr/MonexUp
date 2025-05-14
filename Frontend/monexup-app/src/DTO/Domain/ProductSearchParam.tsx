export default interface ProductSearchParam {
    networkId: number;
    userId: number;
    userSlug: string;
    keyword: string;
    onlyActive: boolean;
    pageNum: number;
}