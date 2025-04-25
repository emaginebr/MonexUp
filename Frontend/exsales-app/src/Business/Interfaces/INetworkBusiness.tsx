import BusinessResult from "../../DTO/Business/BusinessResult";
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import INetworkService from "../../Services/Interfaces/INetworkService";

export default interface INetworkBusiness {
  init: (networkService: INetworkService) => void;
  insert: (network: NetworkInsertInfo) => Promise<BusinessResult<NetworkInfo>>;
  update: (network: NetworkInfo) => Promise<BusinessResult<NetworkInfo>>;
  listByUser: () => Promise<BusinessResult<UserNetworkInfo[]>>;
  getById: (networkId: number) => Promise<BusinessResult<NetworkInfo>>;
  requestAccess: (networkId: number, referrerId?: number) => Promise<BusinessResult<boolean>>;
  changeStatus: (networkId: number, userId: number, status: number) => Promise<BusinessResult<boolean>>; 
}