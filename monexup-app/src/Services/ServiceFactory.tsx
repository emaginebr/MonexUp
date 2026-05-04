import { HttpClient } from '../Infra/Impl/HttpClient';
import IHttpClient from '../Infra/Interface/IHttpClient';
import IUserService from './Interfaces/IUserService';
import UserService from './Impl/UserService';
import INetworkService from './Interfaces/INetworkService';
import NetworkService from './Impl/NetworkService';
import IProfileService from './Interfaces/IProfileService';
import ProfileService from './Impl/ProfileService';
import IProductService from './Interfaces/IProductService';
import ProductService from './Impl/ProductService';
import IOrderService from './Interfaces/IOrderService';
import OrderService from './Impl/OrderService';
import IInvoiceService from './Interfaces/IInvoiceService';
import InvoiceService from './Impl/InvoiceService';
import IImageService from './Interfaces/IImageService';
import ImageService from './Impl/ImageService';
import IProductLinkService from './Interfaces/IProductLinkService';
import ProductLinkService from './Impl/ProductLinkService';
import { TemplateFactory } from '../packages/template';

const TENANT_HEADERS = { 'X-Tenant-Id': process.env.REACT_APP_TENANT_ID || 'monexup' };

const httpClientAuth : IHttpClient = HttpClient();
httpClientAuth.init(process.env.REACT_APP_API_URL, TENANT_HEADERS);

const httpClientNAuth : IHttpClient = HttpClient();
httpClientNAuth.init(process.env.REACT_APP_NAUTH_API_URL, TENANT_HEADERS);

const userServiceImpl : IUserService = UserService;
userServiceImpl.init(httpClientNAuth);

const networkServiceImpl : INetworkService = NetworkService;
networkServiceImpl.init(httpClientAuth);

const profileServiceImpl : IProfileService = ProfileService;
profileServiceImpl.init(httpClientAuth);

// Initialize product package (Lofn API)
const httpClientLofn: IHttpClient = HttpClient();
httpClientLofn.init(
  process.env.REACT_APP_LOFN_API_URL || process.env.REACT_APP_API_URL,
  TENANT_HEADERS
);
const productServiceImpl : IProductService = ProductService;
productServiceImpl.init(httpClientLofn);

const orderServiceImpl : IOrderService = OrderService;
orderServiceImpl.init(httpClientAuth);

const invoiceServiceImpl : IInvoiceService = InvoiceService;
invoiceServiceImpl.init(httpClientAuth);

const imageServiceImpl : IImageService = ImageService;
imageServiceImpl.init(httpClientAuth);

const productLinkServiceImpl : IProductLinkService = ProductLinkService;
productLinkServiceImpl.init(httpClientAuth);

// Initialize template package (Dedalo API)
const httpClientDedalo: IHttpClient = HttpClient();
httpClientDedalo.init(
  process.env.REACT_APP_DEDALO_API_URL || process.env.REACT_APP_API_URL,
  TENANT_HEADERS
);
TemplateFactory.init(httpClientDedalo);

const ServiceFactory = {
  UserService: userServiceImpl,
  NetworkService: networkServiceImpl,
  ProfileService: profileServiceImpl,
  ProductService: productServiceImpl,
  OrderService: orderServiceImpl,
  InvoiceService: invoiceServiceImpl,
  ImageService: imageServiceImpl,
  ProductLinkService: productLinkServiceImpl,
  setLogoffCallback: (cb : () => void) => {
    httpClientAuth.setLogoff(cb);
  }
};

export default ServiceFactory;