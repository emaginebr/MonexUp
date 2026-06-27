import BusinessResult from '../../DTO/Business/BusinessResult';
import IProxyPayStoreService from '../../Services/Interfaces/IProxyPayStoreService';

export default interface IProxyPayStoreBusiness {
  init: (service: IProxyPayStoreService) => void;
  setAbacatePayApiKey: (storeId: number, apiKey: string) => Promise<BusinessResult<void>>;
  getHasAbacatePayApiKey: () => Promise<boolean>;
}
