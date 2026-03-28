import OrderInfo from "../Domain/OrderInfo";

export default interface OrderListPagedResult {
  orders: OrderInfo[];
  pageNum: number;
  pageCount: number;
}
