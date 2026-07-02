import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PixQrView from "./PixQrView";

export interface PixCustomer {
    name: string;
    documentId: string;
    email: string;
    cellphone: string;
}

interface PixModalContainerProps {
    open: boolean;
    onClose: () => void;
    onError: (msg: string) => void;
    /** MonexUp invoice id — drives the status poll against
     *  `/Order/checkPixStatus/{invoiceId}`. When absent the modal renders
     *  nothing. */
    invoiceId?: number | null;
    /** QR payload returned by MonexUp `/Order/createPixPayment`
     *  (`pixPaymentResult.qrCode`). Rendered directly — no invoice is created
     *  in the browser. */
    brCode: string;
    brCodeBase64: string;
    expiredAt?: string;
    /** URL to send the buyer to on the success page CTA. Vendor storefront
     *  passes the seller store URL so "Voltar" returns to the vendor page. */
    returnUrl?: string;
}

export default function PixModalContainer({
    open,
    onClose,
    onError,
    invoiceId,
    brCode,
    brCodeBase64,
    expiredAt,
    returnUrl,
}: PixModalContainerProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Persist returnUrl in sessionStorage so a hard refresh on the success
    // page still knows where to send the buyer.
    useEffect(() => {
        if (!open || !returnUrl || typeof window === "undefined") return;
        window.sessionStorage.setItem("mnx.checkoutReturnUrl", returnUrl);
    }, [open, returnUrl]);

    if (!open || invoiceId == null) return null;

    const handlePaid = () => {
        onClose();
        navigate("/checkout/success", { state: { returnUrl } });
    };

    const modal = (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={t("pix_modal_title")}
        >
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                        {t("pix_modal_title")}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("close")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <span aria-hidden="true" className="text-xl leading-none">
                            &times;
                        </span>
                    </button>
                </div>

                <PixQrView
                    invoiceId={invoiceId}
                    brCode={brCode}
                    brCodeBase64={brCodeBase64}
                    expiredAt={expiredAt}
                    onPaid={handlePaid}
                    onError={onError}
                />
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
