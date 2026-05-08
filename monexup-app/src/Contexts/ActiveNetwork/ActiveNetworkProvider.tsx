import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import NetworkContext from "../Network/NetworkContext";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import ActiveNetworkContext, { ActiveNetworkState } from "./ActiveNetworkContext";

const STORAGE_KEY = "mnx.activeNetworkId";

const ActiveNetworkProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const networkContext = useContext(NetworkContext);
    const userNetworks: UserNetworkInfo[] = networkContext?.userNetworks ?? [];

    const [activeNetworkId, setActiveNetworkIdState] = useState<number | null>(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return stored ? Number(stored) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (userNetworks.length === 0) return;
        const stillValid = activeNetworkId != null
            && userNetworks.some((un) => un.networkId === activeNetworkId);
        if (!stillValid) {
            const fallback = userNetworks[0].networkId;
            setActiveNetworkIdState(fallback);
            try { window.localStorage.setItem(STORAGE_KEY, String(fallback)); } catch { /* ignore */ }
        }
    }, [userNetworks, activeNetworkId]);

    const setActiveNetwork = useCallback((networkId: number) => {
        setActiveNetworkIdState(networkId);
        try { window.localStorage.setItem(STORAGE_KEY, String(networkId)); } catch { /* ignore */ }
    }, []);

    const activeNetwork = useMemo<UserNetworkInfo | null>(() => {
        if (activeNetworkId == null) return null;
        return userNetworks.find((un) => un.networkId === activeNetworkId) ?? null;
    }, [userNetworks, activeNetworkId]);

    const isProvisioned = useMemo(() => {
        return activeNetwork?.network?.lofnStoreId != null && activeNetwork.network.lofnStoreId > 0;
    }, [activeNetwork]);

    const value: ActiveNetworkState = {
        activeNetwork,
        availableNetworks: userNetworks,
        setActiveNetwork,
        isProvisioned,
    };

    return (
        <ActiveNetworkContext.Provider value={value}>
            {children}
        </ActiveNetworkContext.Provider>
    );
};

export default ActiveNetworkProvider;
