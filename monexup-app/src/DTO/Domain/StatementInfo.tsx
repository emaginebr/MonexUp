export default interface StatementInfo {
    proxyPayInvoiceId?: number;
    feeId: number;
    networkId?: number;
    networkName?: string;
    userId?: number;
    buyerName?: string;
    sellerId?: number;
    sellerName?: string;
    description?: string;
    amount: number;
    paidAt?: string;
    withdrawalDueDate?: string;
}
