import ServiceFactory from '../../Services/ServiceFactory';
import ProxyPayStoreBusiness from '../Impl/ProxyPayStoreBusiness';
import IProxyPayStoreBusiness from '../Interfaces/IProxyPayStoreBusiness';

const proxyPayStoreService = ServiceFactory.ProxyPayStoreService;

const proxyPayStoreBusinessImpl: IProxyPayStoreBusiness = ProxyPayStoreBusiness;
proxyPayStoreBusinessImpl.init(proxyPayStoreService);

const ProxyPayStoreFactory = {
  ProxyPayStoreBusiness: proxyPayStoreBusinessImpl,
};

export default ProxyPayStoreFactory;
