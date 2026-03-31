export default interface ProductInfo {
    productId: number;
    storeId: number;
    categoryId: number;
    slug: string;
    imageUrl: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    frequency: number;
    limit: number;
    status: number;
    productType: number;
    featured: boolean;
    images: ProductImageInfo[];
}

export interface ProductImageInfo {
    imageId: number;
    productId: number;
    image: string;
    imageUrl: string;
    sortOrder: number;
}
