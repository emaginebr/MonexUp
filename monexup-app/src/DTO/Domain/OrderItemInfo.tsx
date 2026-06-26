import ProductInfo from "./ProductInfo";

export default interface OrderItemInfo {
    itemId: number;
    orderId: number;
    productId: number;
    quantity: number;
    amount?: number | null;
    product: ProductInfo;
}