import { useContext } from "react";
import ActiveNetworkContext, { ActiveNetworkState } from "../Contexts/ActiveNetwork/ActiveNetworkContext";

export function useActiveNetwork(): ActiveNetworkState {
    return useContext(ActiveNetworkContext);
}
