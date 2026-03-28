import StatementInfo from "../Domain/StatementInfo";

export default interface StatementListPagedResult {
  statements: StatementInfo[];
  pageNum: number;
  pageCount: number;
}
