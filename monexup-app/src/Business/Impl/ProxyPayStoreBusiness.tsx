import BusinessResult from '../../DTO/Business/BusinessResult';
import AuthSession from '../../DTO/Domain/AuthSession';
import IProxyPayStoreService from '../../Services/Interfaces/IProxyPayStoreService';
import AuthFactory from '../Factory/AuthFactory';
import IProxyPayStoreBusiness from '../Interfaces/IProxyPayStoreBusiness';

let _service: IProxyPayStoreService;

const ProxyPayStoreBusiness: IProxyPayStoreBusiness = {
  init: function (service: IProxyPayStoreService): void {
    _service = service;
  },

  setAbacatePayApiKey: async (networkId: number, apiKey: string) => {
    let ret: BusinessResult<void>;
    const session: AuthSession = AuthFactory.AuthBusiness.getSession();
    if (!session) {
      return { ...ret, sucesso: false, mensagem: 'Not logged' };
    }
    const retServ = await _service.setAbacatePayApiKey(networkId, apiKey, session.token);
    if (retServ.success) {
      return { ...ret, sucesso: true };
    }
    return { ...ret, sucesso: false, mensagem: retServ.messageError };
  },

  getHasAbacatePayApiKey: async (networkId: number) => {
    const session: AuthSession = AuthFactory.AuthBusiness.getSession();
    if (!session) {
      return false;
    }
    return await _service.getHasAbacatePayApiKey(networkId, session.token);
  },
};

export default ProxyPayStoreBusiness;
