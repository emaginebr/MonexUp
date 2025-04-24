import BusinessResult from "../../DTO/Business/BusinessResult";
import AuthSession from "../../DTO/Domain/AuthSession";
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import INetworkService from "../../Services/Interfaces/INetworkService";
import AuthFactory from "../Factory/AuthFactory";
import INetworkBusiness from "../Interfaces/INetworkBusiness";

let _networkService: INetworkService;

const NetworkBusiness: INetworkBusiness = {
  init: function (networkService: INetworkService): void {
    _networkService = networkService;
  },
  insert: async (network: NetworkInsertInfo) => {
    //try {
        let ret: BusinessResult<NetworkInfo>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
          return {
            ...ret,
            sucesso: false,
            mensagem: "Not logged"
          };
        }
        let retServ = await _networkService.insert(network, session.token);
        if (retServ.sucesso) {
          return {
            ...ret,
            dataResult: retServ.network,
            sucesso: true
          };
        } else {
          return {
            ...ret,
            sucesso: false,
            mensagem: retServ.mensagem
          };
        }
      /*  
      } catch {
        throw new Error("Failed to insert");
      }
      */
  },
  update: async (network: NetworkInfo) => {
    try {
        let ret: BusinessResult<NetworkInfo>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
          return {
            ...ret,
            sucesso: false,
            mensagem: "Not logged"
          };
        }
        let retServ = await _networkService.update(network, session.token);
        if (retServ.sucesso) {
          return {
            ...ret,
            dataResult: retServ.network,
            sucesso: true
          };
        } else {
          return {
            ...ret,
            sucesso: false,
            mensagem: retServ.mensagem
          };
        }
      } catch {
        throw new Error("Failed to update");
      }
  },
  listByUser: async () => {
    try {
        let ret: BusinessResult<UserNetworkInfo[]>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
          return {
            ...ret,
            sucesso: false,
            mensagem: "Not logged"
          };
        }
        let retServ = await _networkService.listByUser(session.token);
        if (retServ.sucesso) {
          return {
            ...ret,
            dataResult: retServ.networks,
            sucesso: true
          };
        } else {
          return {
            ...ret,
            sucesso: false,
            mensagem: retServ.mensagem
          };
        }
      } catch {
        throw new Error("Failed to get user by email");
      }
  },
  requestAccess: async (networkId: number, referrerId?: number) => {
    try {
        let ret: BusinessResult<boolean>;
        let retServ = await _networkService.requestAccess(networkId, referrerId);
        if (retServ.sucesso) {
          return {
            ...ret,
            dataResult: retServ.sucesso,
            sucesso: true
          };
        } else {
          return {
            ...ret,
            sucesso: false,
            mensagem: retServ.mensagem
          };
        }
      } catch {
        throw new Error("Failed to insert");
      }
  },
  changeStatus: async (networkId: number, userId: number, status: number) => {
    try {
        let ret: BusinessResult<boolean>;
        let session: AuthSession = AuthFactory.AuthBusiness.getSession();
        if (!session) {
          return {
            ...ret,
            sucesso: false,
            mensagem: "Not logged"
          };
        }
        let retServ = await _networkService.changeStatus(networkId, userId, status, session.token);
        if (retServ.sucesso) {
          return {
            ...ret,
            dataResult: retServ.sucesso,
            sucesso: true
          };
        } else {
          return {
            ...ret,
            sucesso: false,
            mensagem: retServ.mensagem
          };
        }
      } catch {
        throw new Error("Failed to get user by email");
      }
  }
}

export default NetworkBusiness;