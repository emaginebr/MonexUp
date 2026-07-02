import BusinessResult from '../../DTO/Business/BusinessResult';
import IProxyPayStoreService from '../../Services/Interfaces/IProxyPayStoreService';

export default interface IProxyPayStoreBusiness {
  init: (service: IProxyPayStoreService) => void;
  setAbacatePayApiKey: (networkId: number, apiKey: string) => Promise<BusinessResult<void>>;
  getHasAbacatePayApiKey: (networkId: number) => Promise<boolean>;
}
