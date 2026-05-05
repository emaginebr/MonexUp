export interface BillingItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export default interface BillingCreateInfo {
  networkId: number;
  customerUserId: number;
  referrerUserId?: number | null;
  frequency: number;
  paymentMethod: number;
  billingStartDate: string;
  items: BillingItemRequest[];
}
