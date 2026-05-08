import { ProductStatusEnum } from "lofn-react";

export default interface ProductSimpleForm {
    productId?: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    status: ProductStatusEnum;
}
