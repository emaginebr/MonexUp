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
import IBillingService from './Interfaces/IBillingService';
import BillingService from './Impl/BillingService';
import IProxyPayStoreService from './Interfaces/IProxyPayStoreService';
import ProxyPayStoreService from './Impl/ProxyPayStoreService';
import IInviteService from './Interfaces/IInviteService';
import InviteService from './Impl/InviteService';
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

// Initialize ProxyPay direct client (frontend talks straight to ProxyPay API)
const PROXYPAY_TENANT_HEADERS = {
  'X-Tenant-Id':
    process.env.REACT_APP_PROXYPAY_TENANT_ID ||
    process.env.REACT_APP_TENANT_ID ||
    'monexup',
};
const httpClientProxyPay: IHttpClient = HttpClient();
httpClientProxyPay.init(
  process.env.REACT_APP_PROXYPAY_API_URL || '',
  PROXYPAY_TENANT_HEADERS
);

const orderServiceImpl : IOrderService = OrderService;
orderServiceImpl.init(httpClientAuth);

const invoiceServiceImpl : IInvoiceService = InvoiceService;
invoiceServiceImpl.init(httpClientAuth);

const imageServiceImpl : IImageService = ImageService;
imageServiceImpl.init(httpClientAuth);

const productLinkServiceImpl : IProductLinkService = ProductLinkService;
productLinkServiceImpl.init(httpClientAuth);

const billingServiceImpl : IBillingService = BillingService;
billingServiceImpl.init(httpClientAuth);

// AbacatePay API Key config now talks to the MonexUp API (per networkId),
// not to the ProxyPay API directly — reuse the MonexUp auth client.
const proxyPayStoreServiceImpl: IProxyPayStoreService = ProxyPayStoreService;
proxyPayStoreServiceImpl.init(httpClientAuth);

// Invite flows go through the MonexUp API (/Network/invite*) — reuse the
// authenticated MonexUp client. Never talk to ProxyPay/NAuth directly.
const inviteServiceImpl: IInviteService = InviteService;
inviteServiceImpl.init(httpClientAuth);

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
  BillingService: billingServiceImpl,
  ProxyPayStoreService: proxyPayStoreServiceImpl,
  InviteService: inviteServiceImpl,
  setLogoffCallback: (cb : () => void) => {
    httpClientAuth.setLogoff(cb);
  }
};

export default ServiceFactory;