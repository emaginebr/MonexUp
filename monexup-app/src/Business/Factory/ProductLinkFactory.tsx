import ServiceFactory from '../../Services/ServiceFactory';
import ProductLinkBusiness from '../Impl/ProductLinkBusiness';
import IProductLinkBusiness from '../Interfaces/IProductLinkBusiness';

const productLinkService = ServiceFactory.ProductLinkService;

const productLinkBusinessImpl: IProductLinkBusiness = ProductLinkBusiness;
productLinkBusinessImpl.init(productLinkService);

const ProductLinkFactory = {
  ProductLinkBusiness: productLinkBusinessImpl,
};

export default ProductLinkFactory;
