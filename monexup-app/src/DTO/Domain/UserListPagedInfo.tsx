import UserInfo from "./UserInfo";

export default interface UserListPagedInfo {
    users: UserInfo[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    pageNum?: number;
    pageCount?: number;
  }