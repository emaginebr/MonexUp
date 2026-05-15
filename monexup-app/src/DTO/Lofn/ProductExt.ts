import type { ProductInfo, ProductInsertInfo, ProductUpdateInfo } from "lofn-react";

/**
 * Lofn type augmentation — the `lofn-react` package shipped to npm is one
 * step behind the C# Lofn backend (which already supports `Donation = 3`,
 * `DonationModeEnum`, and `MinimumDonationAmount`). Until the package is
 * republished we mirror the backend shape here and cast at the call site.
 */

export enum ProductTypeExtended {
    Physical = 1,
    InfoProduct = 2,
    Donation = 3,
}

export enum DonationModeEnum {
    Fixed = 1,
    Free = 2,
}

export type ProductInsertInfoExt = ProductInsertInfo & {
    donationMode?: DonationModeEnum | null;
    minimumDonationAmount?: number | null;
};

export type ProductUpdateInfoExt = ProductUpdateInfo & {
    donationMode?: DonationModeEnum | null;
    minimumDonationAmount?: number | null;
};

export type ProductInfoExt = ProductInfo & {
    donationMode?: DonationModeEnum | null;
    minimumDonationAmount?: number | null;
};
