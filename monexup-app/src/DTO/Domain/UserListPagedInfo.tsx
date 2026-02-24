import UserNetworkSearchInfo from "./UserNetworkSearchInfo";

export default interface UserListPagedInfo {
    users: UserNetworkSearchInfo[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    pageNum?: number;
    pageCount?: number;
  }