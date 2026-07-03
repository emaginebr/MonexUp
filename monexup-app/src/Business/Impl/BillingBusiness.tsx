import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import BillingListItemInfo from "../../DTO/Domain/BillingListItemInfo";
import EnsureStoreResponse from "../../DTO/Domain/EnsureStoreResponse";
import InvoiceSearchParam from "../../DTO/Domain/InvoiceSearchParam";
import InvoiceListPagedResult from "../../DTO/Services/InvoiceListPagedResult";
import IBillingService from "../../Services/Interfaces/IBillingService";
import AuthFactory from "../Factory/AuthFactory";
import IBillingBusiness from "../Interfaces/IBillingBusiness";

let _service: IBillingService;

function emptyResult<T>(): BusinessResult<T> {
  return {} as BusinessResult<T>;
}

function getSession(): AuthSession | null {
  return AuthFactory.AuthBusiness.getSession();
}

const BillingBusiness: IBillingBusiness = {
  init(service: IBillingService) {
    _service = service;
  },

  async ensureStore(networkId: number) {
    const ret = emptyResult<EnsureStoreResponse>();
    const session = getSession();
    if (!session) return { ...ret, sucesso: false, mensagem: "Not logged" };
    const resp = await _service.ensureStore(networkId, session.token);
    return resp.success && resp.data
      ? { ...ret, dataResult: resp.data, sucesso: true }
      : { ...ret, sucesso: false, mensagem: resp.messageError };
  },

  async list(networkId: number, pageNum = 1, pageSize = 20) {
    const ret = emptyResult<BillingListItemInfo[]>();
    const session = getSession();
    if (!session) return { ...ret, sucesso: false, mensagem: "Not logged" };
    const resp = await _service.list(networkId, pageNum, pageSize, session.token);
    return resp.success
      ? { ...ret, dataResult: resp.data, sucesso: true }
      : { ...ret, sucesso: false, mensagem: resp.messageError };
  },

  async searchInvoices(param: InvoiceSearchParam) {
    const ret = emptyResult<InvoiceListPagedResult>();
    const session = getSession();
    if (!session) return { ...ret, sucesso: false, mensagem: "Not logged" };
    const resp = await _service.searchInvoices(param, session.token);
    return resp.success
      ? { ...ret, dataResult: resp.data, sucesso: true }
      : { ...ret, sucesso: false, mensagem: resp.messageError };
  },
};

export default BillingBusiness;
