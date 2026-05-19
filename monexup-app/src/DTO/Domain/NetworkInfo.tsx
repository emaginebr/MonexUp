export default interface NetworkInfo {
    networkId: number;
    slug: string;
    template?: string | null;
    imageUrl: string;
    name: string;
    email: string;
    comission: number;
    withdrawalMin: number;
    withdrawalPeriod: number;
    plan: number;
    status: number;
    qtdyUsers: number;
    maxUsers: number;
    lofnStoreId?: number | null;
    proxypayStoreId?: number | null;
    proxypayClientId?: string | null;
}