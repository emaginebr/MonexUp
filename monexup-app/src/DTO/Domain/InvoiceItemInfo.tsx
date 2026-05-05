export default interface InvoiceItemInfo {
    invoiceItemId: number;
    invoiceId: number;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
}
