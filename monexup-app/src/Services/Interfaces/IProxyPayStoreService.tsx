import IHttpClient from '../../Infra/Interface/IHttpClient';
import ApiResponse from '../../DTO/Services/ApiResponse';

export default interface IProxyPayStoreService {
  init: (httpClient: IHttpClient) => void;
  /** PUT /Network/{networkId}/abacatepay-apikey — write-only. Sucesso = HTTP 204. */
  setAbacatePayApiKey: (
    networkId: number,
    apiKey: string,
    token: string
  ) => Promise<ApiResponse<void>>;
  /** GET /Network/{networkId}/abacatepay-apikey/status — lê hasAbacatePayApiKey. Retorna false em qualquer falha. */
  getHasAbacatePayApiKey: (networkId: number, token: string) => Promise<boolean>;
}
