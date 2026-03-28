import InvoiceInfo from "../Domain/InvoiceInfo";

export default interface InvoiceListPagedResult {
  invoices: InvoiceInfo[];
  pageNum: number;
  pageCount: number;
}
