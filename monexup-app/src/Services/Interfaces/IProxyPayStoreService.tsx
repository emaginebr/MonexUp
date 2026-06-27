import IHttpClient from '../../Infra/Interface/IHttpClient';
import ApiResponse from '../../DTO/Services/ApiResponse';

export default interface IProxyPayStoreService {
  init: (httpClient: IHttpClient) => void;
  /** PUT /Store/{storeId}/abacatepay-apikey — write-only. Sucesso = HTTP 204. */
  setAbacatePayApiKey: (
    storeId: number,
    apiKey: string,
    token: string
  ) => Promise<ApiResponse<void>>;
  /** GraphQL myStore { hasAbacatePayApiKey }. Retorna false em qualquer falha. */
  getHasAbacatePayApiKey: (token: string) => Promise<boolean>;
}
