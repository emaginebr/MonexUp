import ServiceFactory from '../../Services/ServiceFactory';
import BillingBusiness from '../Impl/BillingBusiness';
import IBillingBusiness from '../Interfaces/IBillingBusiness';

const billingService = ServiceFactory.BillingService;

const billingBusinessImpl: IBillingBusiness = BillingBusiness;
billingBusinessImpl.init(billingService);

const BillingFactory = {
  BillingBusiness: billingBusinessImpl,
};

export default BillingFactory;
