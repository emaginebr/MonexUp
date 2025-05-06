import BusinessResult from "../../DTO/Business/BusinessResult";
import InvoiceListPagedInfo from "../../DTO/Domain/InvoiceListPagedInfo";
import IInvoiceService from "../../Services/Interfaces/IInvoiceService";

export default interface IInvoiceBusiness {
  init: (invoiceService: IInvoiceService) => void;
  search: (networkId: number, userId: number, sellerId: number, pageNum: number) => Promise<BusinessResult<InvoiceListPagedInfo>>;
}