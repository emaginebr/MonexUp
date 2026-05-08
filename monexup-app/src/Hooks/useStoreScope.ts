import { useMemo } from "react";
import { useActiveNetwork } from "./useActiveNetwork";

export interface StoreScope {
    storeId: number | null;
    storeSlug: string | null;
    isReady: boolean;
    needsProvisioning: boolean;
}

export function useStoreScope(): StoreScope {
    const { activeNetwork } = useActiveNetwork();

    return useMemo<StoreScope>(() => {
        if (!activeNetwork) {
            return { storeId: null, storeSlug: null, isReady: false, needsProvisioning: false };
        }
        const storeId = activeNetwork.network?.lofnStoreId ?? null;
        if (!storeId) {
            return { storeId: null, storeSlug: null, isReady: false, needsProvisioning: true };
        }
        return {
            storeId,
            storeSlug: String(storeId),
            isReady: true,
            needsProvisioning: false,
        };
    }, [activeNetwork]);
}
