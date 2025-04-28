import env from 'react-dotenv';
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

const httpClientAuth : IHttpClient = HttpClient();
httpClientAuth.init(env.API_BASE_URL);

const userServiceImpl : IUserService = UserService;
userServiceImpl.init(httpClientAuth);

const networkServiceImpl : INetworkService = NetworkService;
networkServiceImpl.init(httpClientAuth);

const profileServiceImpl : IProfileService = ProfileService;
profileServiceImpl.init(httpClientAuth);

const productServiceImpl : IProductService = ProductService;
productServiceImpl.init(httpClientAuth);

const ServiceFactory = {
  UserService: userServiceImpl,
  NetworkService: networkServiceImpl,
  ProfileService: profileServiceImpl,
  ProductService: productServiceImpl,
  setLogoffCallback: (cb : () => void) => {
    httpClientAuth.setLogoff(cb);
  }
};

export default ServiceFactory;