/**
 * InvoiceSearchParam — request body for POST /Billing/searchInvoices.
 * Backend already role-gates (seller sees only own; manager sees all), so
 * the frontend only forwards the network scope + optional filters.
 */
export default interface InvoiceSearchParam {
  networkId: number;
  pageNum: number;
  pageSize: number;
  keyword?: string;
  status?: number | null;
  fromDate?: string;
  toDate?: string;
}
