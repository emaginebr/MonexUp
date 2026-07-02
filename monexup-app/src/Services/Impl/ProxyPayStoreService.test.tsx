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

  it('setAbacatePayApiKey chama PUT /Network/{id}/abacatepay-apikey com body e token', async () => {
    (http.doPutAuth as any).mockResolvedValue({ success: true, httpStatus: '204', data: undefined });

    const ret = await ProxyPayStoreService.setAbacatePayApiKey(7, 'abc_live_1', 'tok');

    expect(http.doPutAuth).toHaveBeenCalledWith(
      '/Network/7/abacatepay-apikey',
      { apiKey: 'abc_live_1' },
      'tok'
    );
    expect(ret.success).toBe(true);
  });

  it('getHasAbacatePayApiKey chama GET /Network/{id}/abacatepay-apikey/status e lê hasAbacatePayApiKey', async () => {
    (http.doGetAuth as any).mockResolvedValue({
      success: true,
      httpStatus: '200',
      data: { sucesso: true, hasAbacatePayApiKey: true },
    });

    const ret = await ProxyPayStoreService.getHasAbacatePayApiKey(7, 'tok');

    expect(http.doGetAuth).toHaveBeenCalledWith(
      '/Network/7/abacatepay-apikey/status',
      'tok'
    );
    expect(ret).toBe(true);
  });

  it('getHasAbacatePayApiKey retorna false quando a chamada falha', async () => {
    (http.doGetAuth as any).mockResolvedValue({ success: false, httpStatus: '500', messageError: 'x' });

    const ret = await ProxyPayStoreService.getHasAbacatePayApiKey(7, 'tok');

    expect(ret).toBe(false);
  });

  it('getHasAbacatePayApiKey retorna false quando hasAbacatePayApiKey vem false', async () => {
    (http.doGetAuth as any).mockResolvedValue({
      success: true,
      httpStatus: '200',
      data: { sucesso: true, hasAbacatePayApiKey: false },
    });

    const ret = await ProxyPayStoreService.getHasAbacatePayApiKey(7, 'tok');

    expect(ret).toBe(false);
  });
});
