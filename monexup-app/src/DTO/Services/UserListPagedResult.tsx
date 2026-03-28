import UserNetworkSearchInfo from "../Domain/UserNetworkSearchInfo";

export default interface UserListPagedResult {
  users: UserNetworkSearchInfo[];
  pageNum: number;
  pageCount: number;
}
