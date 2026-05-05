import { InvoiceStatusEnum } from "../Enum/InvoiceStatusEnum";
import { PaymentMethodEnum } from "../Enum/PaymentMethodEnum";
import InvoiceItemInfo from "./InvoiceItemInfo";

export default interface InvoiceInfo {
    invoiceId: number;
    invoiceNumber?: string;
    notes?: string;
    status: InvoiceStatusEnum;
    paymentMethod: PaymentMethodEnum;
    discount: number;
    dueDate: string;
    externalCode?: string;
    expiresAt?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
    items: InvoiceItemInfo[];
}
