/**
 * VendorProductPage — view-model types
 *
 * The container resolves Network + Seller + Product, then projects a flat
 * `VendorProductViewModel` to whichever template variation is registered for
 * `network.template`. Templates are leaf presentational components; they do
 * not consume contexts directly so they remain trivially testable and
 * swappable.
 */
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import { StorefrontProductInfo } from "../StorefrontPage/types";

/**
 * Payment methods exposed in the vendor surface.
 *
 * NOTE: Only `pix` is wired end-to-end today. `boleto` and `card` render in
 * the UI per the approval mockup but trigger a "coming soon" toast on
 * submit. Backend wiring for non-PIX methods is intentionally out of scope.
 */
export type VendorPaymentMethod = "boleto" | "pix" | "card";

/**
 * Template registry key. Matches `Network.template` (varchar(20)) on the
 * backend. Unknown / null values fall back to "editorial".
 */
export type VendorTemplateKey = "editorial" | "vibrant";

export interface VendorProductViewModel {
    network: NetworkInfo;
    seller: UserNetworkInfo;
    product: StorefrontProductInfo;
}

export interface VendorTemplateProps {
    view: VendorProductViewModel;
    /** Currently selected payment method. PIX is the initial value. */
    paymentMethod: VendorPaymentMethod;
    onPaymentMethodChange: (method: VendorPaymentMethod) => void;
    /** Amount the user wants to pay/donate. For fixed-price products this
     *  equals `product.price`; for open donations it's the live input value. */
    amount: number;
    /** Only set for open donations — controls the editable input. */
    onAmountChange?: (amount: number) => void;
    /** True while a checkout request is in flight (CTA disabled). */
    submitting: boolean;
    /** Primary action — triggers the same flow as `StorefrontPage.handleAction`. */
    onSubmit: () => void;
}
