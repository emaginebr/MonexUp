import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";

const KEY = "mnx.network.selection";

export type StoredSelection = { networkId: number; role: UserRoleEnum };

export const readSelection = (): StoredSelection | null => {
    try {
        if (typeof window === "undefined") return null;
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return null;
        const p = JSON.parse(raw);
        if (typeof p?.networkId !== "number" || typeof p?.role !== "number") return null;
        return p as StoredSelection;
    } catch {
        return null;
    }
};

export const writeSelection = (sel: StoredSelection): void => {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(sel));
    } catch {
        // ignore quota / disabled storage
    }
};

export const clearSelection = (): void => {
    try {
        window.localStorage.removeItem(KEY);
    } catch {
        // ignore
    }
};
