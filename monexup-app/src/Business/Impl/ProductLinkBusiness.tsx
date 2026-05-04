import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import ProductLinkInfo from "../../DTO/Domain/ProductLinkInfo";
import IProductLinkService from "../../Services/Interfaces/IProductLinkService";
import AuthFactory from "../Factory/AuthFactory";
import IProductLinkBusiness from "../Interfaces/IProductLinkBusiness";

let _service: IProductLinkService;

function emptyResult<T>(): BusinessResult<T> {
  return {} as BusinessResult<T>;
}

function getSession(): AuthSession | null {
  return AuthFactory.AuthBusiness.getSession();
}

const ProductLinkBusiness: IProductLinkBusiness = {
  init(service: IProductLinkService) {
    _service = service;
  },

  async upsert(lofnProductId: number, networkId: number, userId: number) {
    const ret = emptyResult<ProductLinkInfo>();
    const session = getSession();
    if (!session) return { ...ret, sucesso: false, mensagem: "Not logged" };

    const delays = [200, 600, 1400];
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      const resp = await _service.upsert({ lofnProductId, networkId, userId }, session.token);
      if (resp.success && resp.data) {
        return { ...ret, dataResult: resp.data, sucesso: true };
      }
      const status = parseInt(resp.httpStatus || "0", 10);
      if (status >= 400 && status < 500) {
        return { ...ret, sucesso: false, mensagem: resp.messageError };
      }
      if (attempt < delays.length) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
    return { ...ret, sucesso: false, mensagem: "Falha ao registrar o link após 3 tentativas." };
  },

  async listByNetwork(networkId: number) {
    const ret = emptyResult<ProductLinkInfo[]>();
    const session = getSession();
    if (!session) return { ...ret, sucesso: false, mensagem: "Not logged" };
    const resp = await _service.listByNetwork(networkId, session.token);
    return resp.success
      ? { ...ret, dataResult: resp.data, sucesso: true }
      : { ...ret, sucesso: false, mensagem: resp.messageError };
  },

  async listByUser(userId: number) {
    const ret = emptyResult<ProductLinkInfo[]>();
    const session = getSession();
    if (!session) return { ...ret, sucesso: false, mensagem: "Not logged" };
    const resp = await _service.listByUser(userId, session.token);
    return resp.success
      ? { ...ret, dataResult: resp.data, sucesso: true }
      : { ...ret, sucesso: false, mensagem: resp.messageError };
  },

  async deleteByNetwork(networkId: number) {
    const ret = emptyResult<unknown>();
    const session = getSession();
    if (!session) return { ...ret, sucesso: false, mensagem: "Not logged" };
    const resp = await _service.deleteByNetwork(networkId, session.token);
    return resp.success
      ? { ...ret, dataResult: resp.data, sucesso: true }
      : { ...ret, sucesso: false, mensagem: resp.messageError };
  },
};

export default ProductLinkBusiness;
