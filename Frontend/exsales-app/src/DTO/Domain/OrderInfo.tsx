import { OrderStatusEnum } from "../Enum/OrderStatusEnum";

export default interface OrderInfo {
    orderId: number;
    productId: number;
    userId: number;
    Status: OrderStatusEnum;
}