import { useState } from "react";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import UserFactory from "../../Business/Factory/UserFactory";
import NetworkContext from "./NetworkContext";
import INetworkProvider from "../../DTO/Contexts/INetworkProvider";
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";
import NetworkFactory from "../../Business/Factory/NetworkFactory";

export default function NetworkProvider(props: any) {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);
    const [loadingRequestAccess, setLoadingRequestAccess] = useState<boolean>(false);
    const [loadingChangeStatus, setLoadingChangeStatus] = useState<boolean>(false);

    const [network, _setNetwork] = useState<NetworkInfo>(null);
    const [userNetworks, setUserNetworks] = useState<UserNetworkInfo[]>([]);

    const networkProviderValue: INetworkProvider = {
        loading: loading,
        loadingUpdate: loadingUpdate,
        loadingRequestAccess: loadingRequestAccess,
        loadingChangeStatus: loadingChangeStatus,

        network: network,
        userNetworks: userNetworks,

        setNetwork: (network: NetworkInfo) => {
            _setNetwork(network);
        },
        insert: async (network: NetworkInsertInfo) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            //try {
                let brt = await NetworkFactory.NetworkBusiness.insert(network);
                if (brt.sucesso) {
                    setLoadingUpdate(false);
                    _setNetwork(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Network added"
                    };
                }
                else {
                    setLoadingUpdate(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            /*
            }
            catch (err) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
            */
        },
        update: async (network: NetworkInfo) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.update(network);
                if (brt.sucesso) {
                    setLoadingUpdate(false);
                    _setNetwork(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "User updated"
                    };
                }
                else {
                    setLoadingUpdate(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            }
            catch (err) {
                setLoadingUpdate(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
        },
        listByUser: async () => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.listByUser();
                if (brt.sucesso) {
                    setLoading(false);
                    setUserNetworks(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Network list"
                    };
                }
                else {
                    setLoading(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            }
            catch (err) {
                setLoading(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
        },
        requestAccess: async (networkId: number, referrerId?: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingRequestAccess(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.requestAccess(networkId, referrerId);
                if (brt.sucesso) {
                    setLoadingRequestAccess(false);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Network list"
                    };
                }
                else {
                    setLoadingRequestAccess(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            }
            catch (err) {
                setLoadingRequestAccess(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
        },
        changeStatus: async (networkId: number, userId: number, status: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingChangeStatus(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.changeStatus(networkId, userId, status);
                if (brt.sucesso) {
                    setLoadingChangeStatus(false);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Network list"
                    };
                }
                else {
                    setLoadingChangeStatus(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            }
            catch (err) {
                setLoadingChangeStatus(false);
                return {
                    ...ret,
                    sucesso: false,
                    mensagemErro: JSON.stringify(err)
                };
            }
        }
    }

    return (
        <NetworkContext.Provider value={networkProviderValue}>
            {props.children}
        </NetworkContext.Provider>
    );
}