import IHttpClient from '../../Infra/Interface/IHttpClient';
import IProxyPayStoreService from '../Interfaces/IProxyPayStoreService';

let _httpClient: IHttpClient;

interface AbacatePayStatusResponse {
  sucesso?: boolean;
  hasAbacatePayApiKey?: boolean;
}

const ProxyPayStoreService: IProxyPayStoreService = {
  init: function (httpClient: IHttpClient): void {
    _httpClient = httpClient;
  },

  setAbacatePayApiKey: async (networkId: number, apiKey: string, token: string) => {
    return await _httpClient.doPutAuth<void>(
      `/Network/${networkId}/abacatepay-apikey`,
      { apiKey },
      token
    );
  },

  getHasAbacatePayApiKey: async (networkId: number, token: string) => {
    const request = await _httpClient.doGetAuth<AbacatePayStatusResponse>(
      `/Network/${networkId}/abacatepay-apikey/status`,
      token
    );
    if (!request.success) {
      return false;
    }
    return request.data?.hasAbacatePayApiKey === true;
  },
};

export default ProxyPayStoreService;
