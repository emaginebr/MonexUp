import NetworkInfo from "../Domain/NetworkInfo";
import NetworkInsertInfo from "../Domain/NetworkInsertInfo";
import UserNetworkInfo from "../Domain/UserNetworkInfo";
import { UserRoleEnum } from "../Enum/UserRoleEnum";
import ProviderResult from "./ProviderResult";


interface INetworkProvider {
    loading: boolean;
    loadingUpdate: boolean;
    loadingRequestAccess: boolean;
    loadingChangeStatus: boolean;

    network: NetworkInfo;
    userNetwork: UserNetworkInfo;
    userNetworks: UserNetworkInfo[];
    currentRole: UserRoleEnum;

    setNetwork: (network: NetworkInfo) => void;
    setUserNetwork: (userNetwork: UserNetworkInfo) => void;
    setCurrentRole: (role: UserRoleEnum) => void;
    insert: (network: NetworkInsertInfo) => Promise<ProviderResult>;
    update: (network: NetworkInfo) => Promise<ProviderResult>;
    listByUser: () => Promise<ProviderResult>;
    getById: (networkId: number) => Promise<ProviderResult>;
    requestAccess: (networkId: number, referrerId?: number) => Promise<ProviderResult>;
    changeStatus: (networkId: number, userId: number, status: number) => Promise<ProviderResult>;
}

export default INetworkProvider;