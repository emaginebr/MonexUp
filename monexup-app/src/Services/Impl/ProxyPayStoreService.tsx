import IHttpClient from '../../Infra/Interface/IHttpClient';
import IProxyPayStoreService from '../Interfaces/IProxyPayStoreService';

let _httpClient: IHttpClient;

interface MyStoreGraphQLResponse {
  data?: { myStore?: Array<{ storeId: number; hasAbacatePayApiKey: boolean }> };
}

const ProxyPayStoreService: IProxyPayStoreService = {
  init: function (httpClient: IHttpClient): void {
    _httpClient = httpClient;
  },

  setAbacatePayApiKey: async (storeId: number, apiKey: string, token: string) => {
    return await _httpClient.doPutAuth<void>(
      `/Store/${storeId}/abacatepay-apikey`,
      { apiKey },
      token
    );
  },

  getHasAbacatePayApiKey: async (token: string) => {
    const request = await _httpClient.doPostAuth<MyStoreGraphQLResponse>(
      '/graphql',
      { query: '{ myStore { storeId hasAbacatePayApiKey } }' },
      token
    );
    if (!request.success) {
      return false;
    }
    const store = request.data?.data?.myStore?.[0];
    return store?.hasAbacatePayApiKey === true;
  },
};

export default ProxyPayStoreService;
