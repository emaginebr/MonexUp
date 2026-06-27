import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../Factory/AuthFactory', () => ({
  default: { AuthBusiness: { getSession: vi.fn() } },
}));

import ProxyPayStoreBusiness from './ProxyPayStoreBusiness';
import IProxyPayStoreService from '../../Services/Interfaces/IProxyPayStoreService';
import AuthFactory from '../Factory/AuthFactory';

function makeServiceMock(): IProxyPayStoreService {
  return {
    init: vi.fn(),
    setAbacatePayApiKey: vi.fn(),
    getHasAbacatePayApiKey: vi.fn(),
  };
}

describe('ProxyPayStoreBusiness', () => {
  let svc: IProxyPayStoreService;

  beforeEach(() => {
    svc = makeServiceMock();
    ProxyPayStoreBusiness.init(svc);
    (AuthFactory.AuthBusiness.getSession as any).mockReturnValue({ token: 'tok' });
  });

  it('setAbacatePayApiKey sucesso quando service retorna 204', async () => {
    (svc.setAbacatePayApiKey as any).mockResolvedValue({ success: true, httpStatus: '204' });

    const ret = await ProxyPayStoreBusiness.setAbacatePayApiKey(5, 'key');

    expect(svc.setAbacatePayApiKey).toHaveBeenCalledWith(5, 'key', 'tok');
    expect(ret.sucesso).toBe(true);
  });

  it('setAbacatePayApiKey repassa mensagem de erro do service', async () => {
    (svc.setAbacatePayApiKey as any).mockResolvedValue({ success: false, messageError: 'forbidden' });

    const ret = await ProxyPayStoreBusiness.setAbacatePayApiKey(5, 'key');

    expect(ret.sucesso).toBe(false);
    expect(ret.mensagem).toBe('forbidden');
  });

  it('setAbacatePayApiKey falha sem sessão', async () => {
    (AuthFactory.AuthBusiness.getSession as any).mockReturnValue(null);

    const ret = await ProxyPayStoreBusiness.setAbacatePayApiKey(5, 'key');

    expect(ret.sucesso).toBe(false);
  });

  it('getHasAbacatePayApiKey delega ao service com o token', async () => {
    (svc.getHasAbacatePayApiKey as any).mockResolvedValue(true);

    const ret = await ProxyPayStoreBusiness.getHasAbacatePayApiKey();

    expect(svc.getHasAbacatePayApiKey).toHaveBeenCalledWith('tok');
    expect(ret).toBe(true);
  });
});
