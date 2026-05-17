import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PixPayment } from "proxypay-react";

export interface PixCustomer {
    name: string;
    documentId: string;
    email: string;
    cellphone: string;
}

interface PixModalContainerProps {
    open: boolean;
    productId: number;
    productName: string;
    amount: number;
    customer: PixCustomer;
    onClose: () => void;
    onError: (msg: string) => void;
}

export default function PixModalContainer({
    open,
    productId,
    productName,
    amount,
    customer,
    onClose,
    onError,
}: PixModalContainerProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const lastOpenedKey = useRef<string>("");

    const renderKey = `${productId}-${amount}-${customer.documentId}`;

    useEffect(() => {
        if (open && triggerRef.current && lastOpenedKey.current !== renderKey) {
            lastOpenedKey.current = renderKey;
            triggerRef.current.click();
        }
        if (!open) {
            lastOpenedKey.current = "";
        }
    }, [open, renderKey]);

    if (!open) return null;

    return (
        <PixPayment
            key={renderKey}
            customer={customer}
            items={[{
                id: String(productId),
                description: productName,
                quantity: 1,
                unitPrice: amount,
                discount: 0,
            }]}
            onSuccess={() => {
                onClose();
                navigate("/checkout/success");
            }}
            onError={(err: Error) => {
                onError(err.message || t("pix_expired"));
            }}
            pollInterval={5000}
            modalTitle={t("pix_modal_title")}
        >
            <button
                ref={triggerRef}
                type="button"
                style={{ display: "none" }}
                aria-hidden="true"
            >
                open
            </button>
        </PixPayment>
    );
}
