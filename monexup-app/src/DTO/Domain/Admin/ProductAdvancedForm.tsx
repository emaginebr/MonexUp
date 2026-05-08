import { ProductStatusEnum } from "lofn-react";

export interface ProductImageEntry {
    url: string;
    order: number;
}

export interface ProductFilterValueRef {
    productTypeId: number;
    filterValueId: number;
}

export default interface ProductAdvancedForm {
    productId?: number;
    name: string;
    description?: string;
    richDescription?: string;
    price: number;
    status: ProductStatusEnum;
    categoryId: number | null;
    images: ProductImageEntry[];
    filterValues: ProductFilterValueRef[];
}
