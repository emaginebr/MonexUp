import React from "react";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";

export interface ActiveNetworkState {
    activeNetwork: UserNetworkInfo | null;
    availableNetworks: UserNetworkInfo[];
    setActiveNetwork: (networkId: number) => void;
    isProvisioned: boolean;
}

const ActiveNetworkContext = React.createContext<ActiveNetworkState>({
    activeNetwork: null,
    availableNetworks: [],
    setActiveNetwork: () => undefined,
    isProvisioned: false,
});

export default ActiveNetworkContext;
