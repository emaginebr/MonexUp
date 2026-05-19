/**
 * Vendor product template registry.
 *
 * Adds a new visual variation:
 *   1. Implement the template component (props = `VendorTemplateProps`).
 *   2. Register it under a new `VendorTemplateKey` value here.
 *   3. Set `Network.template` on the backend to that key.
 *
 * Unknown / null `Network.template` falls back to `DEFAULT_TEMPLATE` —
 * NEVER throw, never render a blank page.
 */
import { ComponentType } from "react";
import { VendorTemplateKey, VendorTemplateProps } from "../types";
import EditorialTemplate from "./EditorialTemplate";
import VibrantTemplate from "./VibrantTemplate";

export const DEFAULT_TEMPLATE: VendorTemplateKey = "editorial";

const REGISTRY: Record<VendorTemplateKey, ComponentType<VendorTemplateProps>> = {
    editorial: EditorialTemplate,
    vibrant: VibrantTemplate,
};

export function resolveTemplate(key: string | null | undefined): ComponentType<VendorTemplateProps> {
    const normalized = (key || "").trim().toLowerCase() as VendorTemplateKey;
    return REGISTRY[normalized] ?? REGISTRY[DEFAULT_TEMPLATE];
}

export { EditorialTemplate, VibrantTemplate };
