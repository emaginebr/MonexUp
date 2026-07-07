import BusinessResult from "../../DTO/Business/BusinessResult";
import MemberBalanceInfo from "../../DTO/Domain/MemberBalanceInfo";
import StatementListPagedInfo from "../../DTO/Domain/StatementListPagedInfo";
import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import IInvoiceService from "../../Services/Interfaces/IInvoiceService";

export default interface IInvoiceBusiness {
  init: (invoiceService: IInvoiceService) => void;
  searchStatement: (param: StatementSearchParam) => Promise<BusinessResult<StatementListPagedInfo>>;
  getBalance: (networkId?: number) => Promise<BusinessResult<number>>;
  getAvailableBalance: () => Promise<BusinessResult<number>>;
  getMyBalance: (networkId: number) => Promise<BusinessResult<MemberBalanceInfo>>;
  getNetworkBalance: (networkId: number) => Promise<BusinessResult<MemberBalanceInfo>>;
}
