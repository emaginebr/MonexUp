import { useCallback } from "react";
import { useCategory } from "lofn-react";
import { useStoreScope } from "./useStoreScope";

const cache = new Map<number, number>();

export const DEFAULT_CATEGORY_NAME = "_default";

export function useDefaultCategory() {
    const { storeId, storeSlug } = useStoreScope();
    const categoryApi = useCategory();

    const ensureDefaultCategory = useCallback(async (overrideStoreId?: number, overrideStoreSlug?: string): Promise<number> => {
        const effectiveStoreId = overrideStoreId ?? storeId;
        const effectiveStoreSlug = overrideStoreSlug ?? storeSlug;
        if (!effectiveStoreId || !effectiveStoreSlug) {
            throw new Error("Active store not resolved");
        }

        const cached = cache.get(effectiveStoreId);
        if (cached) return cached;

        const list = await categoryApi.listActive(effectiveStoreSlug);
        const found = (list ?? []).find((c) => c?.name === DEFAULT_CATEGORY_NAME);
        if (found?.categoryId) {
            cache.set(effectiveStoreId, found.categoryId);
            return found.categoryId;
        }

        const created = await categoryApi.insert(effectiveStoreSlug, {
            name: DEFAULT_CATEGORY_NAME,
            parentCategoryId: null,
        } as any);
        if (!created?.categoryId) {
            throw new Error("Failed to create default category");
        }
        cache.set(effectiveStoreId, created.categoryId);
        return created.categoryId;
    }, [storeId, storeSlug, categoryApi]);

    return { ensureDefaultCategory };
}
