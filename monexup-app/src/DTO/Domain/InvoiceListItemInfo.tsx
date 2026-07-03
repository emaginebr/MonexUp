/**
 * InvoiceListItemInfo — flat row shape returned by POST /Billing/searchInvoices.
 * Backend joins invoice → parent order → buyer/seller so the row can render
 * without extra fetches. Kept intentionally loose (strings from ProxyPay may
 * come back as DateTime.MinValue, which invoiceHelpers.isValidDate guards).
 */
export default interface InvoiceListItemInfo {
  invoiceId: number;
  invoiceNumber?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
  status: number;
  total: number;
  orderId: number;
  buyerId: number;
  buyerName?: string | null;
  buyerEmail?: string | null;
  sellerId: number;
  sellerName?: string | null;
}
