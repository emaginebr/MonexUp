import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import StatementListPagedInfo from "../../DTO/Domain/StatementListPagedInfo";
import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import IInvoiceService from "../../Services/Interfaces/IInvoiceService";
import AuthFactory from "../Factory/AuthFactory";
import IInvoiceBusiness from "../Interfaces/IInvoiceBusiness";

let _invoiceService: IInvoiceService;

const InvoiceBusiness: IInvoiceBusiness = {
  init: function (invoiceService: IInvoiceService): void {
    _invoiceService = invoiceService;
  },
  searchStatement: async (param: StatementSearchParam) => {
    try {
      let ret: BusinessResult<StatementListPagedInfo>;
      let session: AuthSession = AuthFactory.AuthBusiness.getSession();
      if (!session) {
        return {
          ...ret,
          sucesso: false,
          mensagem: "Not logged"
        };
      }
      let retServ = await _invoiceService.searchStatement(param, session.token);
      if (retServ.success) {
        let orderPaged: StatementListPagedInfo;
        orderPaged = {
          ...orderPaged,
          statements: retServ.data.statements,
          pageNum: retServ.data.pageNum,
          pageCount: retServ.data.pageCount
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
          mensagem: retServ.messageError
        };
      }
    } catch {
      throw new Error("Failed to fetch statement");
    }
  },
  getBalance: async (networkId?: number) => {
    try {
      let ret: BusinessResult<number>;
      let session: AuthSession = AuthFactory.AuthBusiness.getSession();
      if (!session) {
        return {
          ...ret,
          sucesso: false,
          mensagem: "Not logged"
        };
      }
      let retServ = await _invoiceService.getBalance(session.token, networkId);
      if (retServ.success) {
        return {
          ...ret,
          dataResult: retServ.data,
          sucesso: true
        };
      } else {
        return {
          ...ret,
          sucesso: false,
          mensagem: retServ.messageError
        };
      }
    } catch {
      throw new Error("Failed to fetch balance");
    }
  },
  getAvailableBalance: async () => {
    try {
      let ret: BusinessResult<number>;
      let session: AuthSession = AuthFactory.AuthBusiness.getSession();
      if (!session) {
        return {
          ...ret,
          sucesso: false,
          mensagem: "Not logged"
        };
      }
      let retServ = await _invoiceService.getAvailableBalance(session.token);
      if (retServ.success) {
        return {
          ...ret,
          dataResult: retServ.data,
          sucesso: true
        };
      } else {
        return {
          ...ret,
          sucesso: false,
          mensagem: retServ.messageError
        };
      }
    } catch {
      throw new Error("Failed to fetch available balance");
    }
  }
}

export default InvoiceBusiness;
