import type { ProductInfo as BaseProductInfo } from "lofn-react";
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";

export const PRODUCT_TYPE_DONATION = 3;

export enum DonationModeEnum {
    Fixed = 1,
    Open = 2,
}

export interface StorefrontProductInfo extends BaseProductInfo {
    donationMode?: DonationModeEnum | null;
    minimumDonationAmount?: number | null;
}

export function isDonation(product: BaseProductInfo): boolean {
    return Number(product.productType) === PRODUCT_TYPE_DONATION;
}

export function isOpenDonation(product: StorefrontProductInfo): boolean {
    return isDonation(product) && product.donationMode === DonationModeEnum.Open;
}

/* ============================================================================
   Storefront list view-model — projected from contexts by `StorefrontPage` and
   handed to whichever template variation resolves from `network.template`.
   Templates are leaf presentational components; they do not consume contexts
   directly so they remain trivially testable and swappable.
   ============================================================================ */

/**
 * Template registry key for the storefront listing. Mirrors `Network.template`
 * (varchar(20)) on the backend. Unknown / null values fall back to "editorial".
 * MUST stay in sync with `VendorTemplateKey` in `VendorProductPage/types.ts`
 * — both pages are driven by the same column.
 */
export type StorefrontTemplateKey = "editorial" | "vibrant";

export type StorefrontPageState =
    | "loading"
    | "ready"
    | "unavailable"
    | "seller_not_found";

export interface StorefrontViewModel {
    network: NetworkInfo;
    seller: UserNetworkInfo;
    /** Current page slice of products. Empty array triggers the empty state. */
    products: StorefrontProductInfo[];
    /** 1-based page number. Defaults to 1 when no result yet. */
    pageNum: number;
    /** Total page count. `<= 1` hides pagination. */
    pageCount: number;
    /** True while the search call is in flight (template renders a skeleton). */
    loading: boolean;
}

export interface StorefrontTemplateProps {
    view: StorefrontViewModel;
    /** Network slug — used to build product detail links. */
    networkSlug: string;
    /** Seller slug — used to build product detail links. */
    sellerSlug: string;
    /** Switch to a specific 1-based page. Template fires this from pagination. */
    onPageChange: (page: number) => void;
}
