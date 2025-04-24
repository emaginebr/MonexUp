import NetworkInfo from "../Domain/NetworkInfo";
import NetworkInsertInfo from "../Domain/NetworkInsertInfo";
import UserNetworkInfo from "../Domain/UserNetworkInfo";
import ProviderResult from "./ProviderResult";


interface INetworkProvider {
    loading: boolean;
    loadingUpdate: boolean;
    loadingRequestAccess: boolean;
    loadingChangeStatus: boolean;

    network: NetworkInfo;
    userNetworks: UserNetworkInfo[];

    setNetwork: (network: NetworkInfo) => void;
    insert: (network: NetworkInsertInfo) => Promise<ProviderResult>;
    update: (network: NetworkInfo) => Promise<ProviderResult>;
    listByUser: () => Promise<ProviderResult>;
    requestAccess: (networkId: number, referrerId?: number) => Promise<ProviderResult>;
    changeStatus: (networkId: number, userId: number, status: number) => Promise<ProviderResult>;
}

export default INetworkProvider;