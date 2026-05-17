import type { ProductInfo as BaseProductInfo } from "lofn-react";

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
