export default interface BillingListItemInfo {
  proxypayBillingId: number;
  customerName: string;
  customerUserId?: number | null;
  referrerUserId?: number | null;
  frequency: number;
  nextChargeDate?: string | null;
  status: number;
  latestInvoiceStatus?: number | null;
}
