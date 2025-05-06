import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import InvoiceListPagedInfo from "../../DTO/Domain/InvoiceListPagedInfo";
import IInvoiceService from "../../Services/Interfaces/IInvoiceService";
import AuthFactory from "../Factory/AuthFactory";
import IInvoiceBusiness from "../Interfaces/IInvoiceBusiness";

let _invoiceService: IInvoiceService;

const InvoiceBusiness: IInvoiceBusiness = {
  init: function (invoiceService: IInvoiceService): void {
    _invoiceService = invoiceService;
  },
  search: async (networkId: number, userId: number, sellerId: number, pageNum: number) => {
    try {
      let ret: BusinessResult<InvoiceListPagedInfo>;
      let session: AuthSession = AuthFactory.AuthBusiness.getSession();
      if (!session) {
        return {
          ...ret,
          sucesso: false,
          mensagem: "Not logged"
        };
      }
      let retServ = await _invoiceService.search(networkId, userId, sellerId, pageNum, session.token);
      if (retServ.sucesso) {
        let orderPaged: InvoiceListPagedInfo;
        orderPaged = {
          ...orderPaged,
          invoices: retServ.invoices,
          pageNum: retServ.pageNum,
          pageCount: retServ.pageCount
        }
        return {
          ...ret,
          dataResult: orderPaged,
          sucesso: true
        };
      } else {
        return {
          ...ret,
          sucesso: false,
          mensagem: retServ.mensagem
        };
      }
    } catch {
      throw new Error("Failed to get user by email");
    }
  }
}

export default InvoiceBusiness;