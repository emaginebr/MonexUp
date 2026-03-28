import OrderInfo from "../Domain/OrderInfo";

export default interface SubscriptionResult {
    order: OrderInfo;
    clientSecret: string;
}
