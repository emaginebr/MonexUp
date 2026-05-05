export default interface InvoiceFeeInfo {
    feeId: number;
    proxyPayInvoiceId?: number;
    networkId?: number;
    userId?: number;
    amount: number;
    paidAt?: string;
    withdrawalDueDate?: string;
}
