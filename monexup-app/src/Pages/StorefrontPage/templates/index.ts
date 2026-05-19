/**
 * Storefront list template registry.
 *
 * Adds a new visual variation:
 *   1. Implement the template component (props = `StorefrontTemplateProps`).
 *   2. Register it under a new `StorefrontTemplateKey` value here.
 *   3. Set `Network.template` on the backend to that key.
 *
 * Unknown / null `Network.template` falls back to `DEFAULT_TEMPLATE` —
 * NEVER throw, never render a blank page.
 *
 * Keys are kept in sync with `VendorProductPage/templates/index.ts` so the
 * same `network.template` value drives both the listing and the detail.
 */
import { ComponentType } from "react";
import { StorefrontTemplateKey, StorefrontTemplateProps } from "../types";
import EditorialListTemplate from "./EditorialListTemplate";
import VibrantListTemplate from "./VibrantListTemplate";

export const DEFAULT_TEMPLATE: StorefrontTemplateKey = "editorial";

const REGISTRY: Record<StorefrontTemplateKey, ComponentType<StorefrontTemplateProps>> = {
    editorial: EditorialListTemplate,
    vibrant: VibrantListTemplate,
};

export function resolveTemplate(key: string | null | undefined): ComponentType<StorefrontTemplateProps> {
    const normalized = (key || "").trim().toLowerCase() as StorefrontTemplateKey;
    return REGISTRY[normalized] ?? REGISTRY[DEFAULT_TEMPLATE];
}

export { EditorialListTemplate, VibrantListTemplate };
