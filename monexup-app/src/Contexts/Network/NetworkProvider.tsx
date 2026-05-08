import { useContext, useEffect, useRef, useState } from "react";
import ProviderResult from "../../DTO/Contexts/ProviderResult";
import NetworkContext from "./NetworkContext";
import INetworkProvider from "../../DTO/Contexts/INetworkProvider";
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";
import NetworkFactory from "../../Business/Factory/NetworkFactory";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import NetworkProviderResult from "../../DTO/Contexts/NetworkProviderResult";
import { readSelection, writeSelection, clearSelection } from "./networkStorage";
import AuthContext from "../Auth/AuthContext";

export default function NetworkProvider(props: any) {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingTeam, setLoadingTeam] = useState<boolean>(false);
    const [loadingSeller, setLoadingSeller] = useState<boolean>(false);
    const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);
    const [loadingRequestAccess, setLoadingRequestAccess] = useState<boolean>(false);

    const [network, _setNetwork] = useState<NetworkInfo>(null);
    const [networks, setNetworks] = useState<NetworkInfo[]>([]);
    const [userNetwork, _setUserNetwork] = useState<UserNetworkInfo>(null);
    const [seller, setSeller] = useState<UserNetworkInfo>(null);
    const [userNetworks, setUserNetworks] = useState<UserNetworkInfo[]>([]);
    const [teams, setTeams] = useState<UserNetworkInfo[]>([]);
    const [currentRole, _setCurrentRole] = useState<UserRoleEnum>(UserRoleEnum.User);

    const networkProviderValue: INetworkProvider = {
        loading: loading,
        loadingTeam: loadingTeam,
        loadingSeller: loadingSeller,
        loadingUpdate: loadingUpdate,
        loadingRequestAccess: loadingRequestAccess,

        network: network,
        networks: networks,
        userNetwork: userNetwork,
        seller: seller,
        userNetworks: userNetworks,
        teams: teams,
        currentRole: currentRole,

        setNetwork: (network: NetworkInfo) => {
            _setNetwork(network);
        },
        setUserNetwork: (userNetwork: UserNetworkInfo) => {
            _setUserNetwork(userNetwork);
            _setNetwork(userNetwork?.network);
            _setCurrentRole(userNetwork?.role ?? UserRoleEnum.NoRole);
            if (userNetwork) {
                writeSelection({ networkId: userNetwork.networkId, role: userNetwork.role });
            } else {
                clearSelection();
            }
        },
        setCurrentRole: (role: UserRoleEnum) => {
            _setCurrentRole(role);
            if (userNetwork) {
                writeSelection({ networkId: userNetwork.networkId, role });
            }
        },
        clear: () => {
            _setUserNetwork(null);
            _setNetwork(null);
            _setCurrentRole(UserRoleEnum.NoRole);
            setUserNetworks([]);
            setNetworks([]);
            setSeller(null);
            setTeams([]);
            clearSelection();
        },
        /*
        setEditMode: (edit: boolean) => {
            if (edit) {
                if (currentRole >= UserRoleEnum.NetworkManager) {
                    _setEditMode(true);                
                }
                else {
                    _setEditMode(false);
                }
            }
            else {
                _setEditMode(false);
            }
        },
        */

        ensureLofnStore: async (networkId: number) => {
            let ret: any;
            const brt = await NetworkFactory.NetworkBusiness.ensureLofnStore(networkId);
            if (brt.sucesso) {
                if (brt.dataResult) {
                    _setNetwork(brt.dataResult);
                }
                return {
                    ...ret,
                    network: brt.dataResult,
                    sucesso: true,
                    mensagemSucesso: "Lofn store ensured",
                };
            }
            return {
                ...ret,
                sucesso: false,
                mensagemErro: brt.mensagem,
            };
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
        listAll: async () => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.listAll();
                if (brt.sucesso) {
                    setLoading(false);
                    setNetworks(brt.dataResult);
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
        listByNetwork: async (networkSlug: string) => {
            let ret: Promise<ProviderResult>;
            setLoadingTeam(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.listByNetwork(networkSlug);
                if (brt.sucesso) {
                    setLoadingTeam(false);
                    setTeams(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Network list"
                    };
                }
                else {
                    setLoadingTeam(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            }
            catch (err) {
                setLoadingTeam(false);
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
                    const list: UserNetworkInfo[] = brt.dataResult ?? [];
                    setUserNetworks(list);

                    if (list.length === 0) {
                        clearSelection();
                        _setUserNetwork(null);
                        _setNetwork(null);
                        _setCurrentRole(UserRoleEnum.NoRole);
                    } else {
                        const stored = readSelection();
                        const found = stored
                            ? list.find((un) => un.networkId === stored.networkId)
                            : null;

                        if (found) {
                            _setUserNetwork(found);
                            _setNetwork(found.network);
                            const effective = stored.role <= found.role ? stored.role : found.role;
                            _setCurrentRole(effective);
                            if (effective !== stored.role) {
                                writeSelection({ networkId: found.networkId, role: effective });
                            }
                        } else {
                            const first = list[0];
                            _setUserNetwork(first);
                            _setNetwork(first.network);
                            _setCurrentRole(first.role);
                            writeSelection({ networkId: first.networkId, role: first.role });
                        }
                    }

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
        getById: async (networkId: number) => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.getById(networkId);
                if (brt.sucesso) {
                    setLoading(false);
                    _setNetwork(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Load Network"
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
        getBySlug: async (networkSlug: string) => {
            let ret: Promise<NetworkProviderResult>;
            setLoading(true);
            _setNetwork(null);
            try {
                let brt = await NetworkFactory.NetworkBusiness.getBySlug(networkSlug);
                if (brt.sucesso) {
                    setLoading(false);
                    _setNetwork(brt.dataResult);
                    return {
                        ...ret,
                        network: brt.dataResult,
                        sucesso: true,
                        mensagemSucesso: "Load Network"
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
        getUserNetwork: async (networkId: number) => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.getUserNetwork(networkId);
                if (brt.sucesso) {
                    setLoading(false);
                    _setUserNetwork(brt.dataResult);
                    //_setNetwork(brt.dataResult.network);
                    if (brt.dataResult) {
                        _setCurrentRole(brt.dataResult.role);
                    }
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Load Network"
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
        getUserNetworkBySlug: async (networkSlug: string) => {
            let ret: Promise<ProviderResult>;
            setLoading(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.getUserNetworkBySlug(networkSlug);
                if (brt.sucesso) {
                    setLoading(false);
                    _setUserNetwork(brt.dataResult);
                    if (brt.dataResult) {
                        _setCurrentRole(brt.dataResult.role);
                    }
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Load Network"
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
        getSellerBySlug: async (networkSlug: string, userSlug: string) => {
            let ret: Promise<ProviderResult>;
            setLoadingSeller(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.getSellerBySlug(networkSlug, userSlug);
                if (brt.sucesso) {
                    setLoadingSeller(false);
                    setSeller(brt.dataResult);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Load Network"
                    };
                }
                else {
                    setLoadingSeller(false);
                    return {
                        ...ret,
                        sucesso: false,
                        mensagemErro: brt.mensagem
                    };
                }
            }
            catch (err) {
                setLoadingSeller(false);
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
            setLoadingUpdate(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.changeStatus(networkId, userId, status);
                if (brt.sucesso) {
                    setLoadingUpdate(false);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Network list"
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
        promote: async (networkId: number, userId: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.promote(networkId, userId);
                if (brt.sucesso) {
                    setLoadingUpdate(false);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Network list"
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
        demote: async (networkId: number, userId: number) => {
            let ret: Promise<ProviderResult>;
            setLoadingUpdate(true);
            try {
                let brt = await NetworkFactory.NetworkBusiness.demote(networkId, userId);
                if (brt.sucesso) {
                    setLoadingUpdate(false);
                    return {
                        ...ret,
                        sucesso: true,
                        mensagemSucesso: "Network list"
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
        }
    }

    const authContext = useContext(AuthContext);
    const sessionUserId = authContext?.sessionInfo?.userId ?? null;
    const lastBootstrappedUserId = useRef<number | null>(null);

    useEffect(() => {
        if (authContext?.loading) return;
        if (sessionUserId && lastBootstrappedUserId.current !== sessionUserId) {
            lastBootstrappedUserId.current = sessionUserId;
            networkProviderValue.listByUser();
        }
        if (!sessionUserId && lastBootstrappedUserId.current !== null) {
            // Session ended (logout) — wipe network state so a new login
            // doesn't leak the previous user's selection.
            lastBootstrappedUserId.current = null;
            networkProviderValue.clear?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionUserId, authContext?.loading]);

    return (
        <NetworkContext.Provider value={networkProviderValue}>
            {props.children}
        </NetworkContext.Provider>
    );
}