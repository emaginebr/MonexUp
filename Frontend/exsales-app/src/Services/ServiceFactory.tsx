import env from 'react-dotenv';
import { HttpClient } from '../Infra/Impl/HttpClient';
import IHttpClient from '../Infra/Interface/IHttpClient';
import IUserService from './Interfaces/IUserService';
import UserService from './Impl/UserService';
import INetworkService from './Interfaces/INetworkService';
import NetworkService from './Impl/NetworkService';

const httpClientAuth : IHttpClient = HttpClient();
httpClientAuth.init(env.API_BASE_URL);

const userServiceImpl : IUserService = UserService;
userServiceImpl.init(httpClientAuth);

const networkServiceImpl : INetworkService = NetworkService;
networkServiceImpl.init(httpClientAuth);

const ServiceFactory = {
  UserService: userServiceImpl,
  NetworkService: networkServiceImpl,
  setLogoffCallback: (cb : () => void) => {
    httpClientAuth.setLogoff(cb);
  }
};

export default ServiceFactory;