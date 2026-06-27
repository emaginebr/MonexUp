import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProxyPayStoreService from './ProxyPayStoreService';
import IHttpClient from '../../Infra/Interface/IHttpClient';

function makeHttpClientMock(): IHttpClient {
  return {
    init: vi.fn(),
    setLogoff: vi.fn(),
    doPost: vi.fn(),
    doPostAuth: vi.fn(),
    doGet: vi.fn(),
    doGetAuth: vi.fn(),
    doDeleteAuth: vi.fn(),
    doPutAuth: vi.fn(),
    doPostFormData: vi.fn(),
    doPostFormDataAuth: vi.fn(),
  } as unknown as IHttpClient;
}

describe('ProxyPayStoreService', () => {
  let http: IHttpClient;

  beforeEach(() => {
    http = makeHttpClientMock();
    ProxyPayStoreService.init(http);
  });

  it('setAbacatePayApiKey chama PUT /Store/{id}/abacatepay-apikey com body e token', async () => {
    (http.doPutAuth as any).mockResolvedValue({ success: true, httpStatus: '204', data: undefined });

    const ret = await ProxyPayStoreService.setAbacatePayApiKey(7, 'abc_live_1', 'tok');

    expect(http.doPutAuth).toHaveBeenCalledWith(
      '/Store/7/abacatepay-apikey',
      { apiKey: 'abc_live_1' },
      'tok'
    );
    expect(ret.success).toBe(true);
  });

  it('getHasAbacatePayApiKey retorna o booleano do primeiro myStore', async () => {
    (http.doPostAuth as any).mockResolvedValue({
      success: true,
      httpStatus: '200',
      data: { data: { myStore: [{ storeId: 1, hasAbacatePayApiKey: true }] } },
    });

    const ret = await ProxyPayStoreService.getHasAbacatePayApiKey('tok');

    expect(http.doPostAuth).toHaveBeenCalledWith(
      '/graphql',
      { query: '{ myStore { storeId hasAbacatePayApiKey } }' },
      'tok'
    );
    expect(ret).toBe(true);
  });

  it('getHasAbacatePayApiKey retorna false quando a chamada falha', async () => {
    (http.doPostAuth as any).mockResolvedValue({ success: false, httpStatus: '500', messageError: 'x' });

    const ret = await ProxyPayStoreService.getHasAbacatePayApiKey('tok');

    expect(ret).toBe(false);
  });

  it('getHasAbacatePayApiKey retorna false quando myStore vem vazio', async () => {
    (http.doPostAuth as any).mockResolvedValue({
      success: true,
      httpStatus: '200',
      data: { data: { myStore: [] } },
    });

    const ret = await ProxyPayStoreService.getHasAbacatePayApiKey('tok');

    expect(ret).toBe(false);
  });
});
