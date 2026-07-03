import InvoiceListItemInfo from "../Domain/InvoiceListItemInfo";

/**
 * InvoiceListPagedResult — server envelope for POST /Billing/searchInvoices.
 * Mirrors the pageNum/pageSize/totalCount/totalPages shape used by the
 * .NET backend so no re-mapping is needed in the service layer.
 */
export default interface InvoiceListPagedResult {
  invoices: InvoiceListItemInfo[];
  pageNum: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
