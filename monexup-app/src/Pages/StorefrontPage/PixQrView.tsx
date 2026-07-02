import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OrderContext from "../../Contexts/Order/OrderContext";
import IOrderProvider from "../../DTO/Contexts/IOrderProvider";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";

interface PixQrViewProps {
    invoiceId: number;
    brCode: string;
    brCodeBase64: string;
    expiredAt?: string;
    onPaid: () => void;
    onError?: (msg: string) => void;
}

const POLL_INTERVAL_MS = 4000;

/**
 * Renders the PIX QR code returned by the MonexUp backend
 * (`/Order/createPixPayment`) and polls MonexUp's own
 * `/Order/checkPixStatus/{invoiceId}` endpoint to detect payment. No direct
 * access to proxypay.online happens here — everything flows through the
 * OrderContext → OrderBusiness → OrderService chain.
 */
export default function PixQrView({
    invoiceId,
    brCode,
    brCodeBase64,
    expiredAt,
    onPaid,
    onError,
}: PixQrViewProps) {
    const { t } = useTranslation();
    const orderContext = useContext<IOrderProvider>(OrderContext);
    const [copied, setCopied] = useState<boolean>(false);
    const [simulating, setSimulating] = useState<boolean>(false);
    const [toastShow, setToastShow] = useState<boolean>(false);
    const [toastMsg, setToastMsg] = useState<string>("");
    const [toastDialog, setToastDialog] = useState<MessageToastEnum>(MessageToastEnum.Success);

    // Dev-only: asks the MonexUp backend to simulate the payment; MonexUp relays
    // to ProxyPay. The browser never calls ProxyPay directly. The status poller
    // above then detects the paid state and drives onPaid().
    const handleSimulate = async () => {
        if (invoiceId == null || simulating) return;
        setSimulating(true);
        try {
            const res = await orderContext.simulatePixPayment(invoiceId);
            if (res?.sucesso === false) {
                throw new Error(res?.mensagem || t("payment_error"));
            }
            setToastDialog(MessageToastEnum.Success);
            setToastMsg(t("pix_simulate_success"));
            setToastShow(true);
        } catch (err: any) {
            const msg = err?.message || t("payment_error");
            setToastDialog(MessageToastEnum.Error);
            setToastMsg(`${t("pix_simulate_error")}: ${msg}`);
            setToastShow(true);
            if (onError) onError(msg);
        } finally {
            setSimulating(false);
        }
    };

    // Accept either a bare base64 payload or a full data-uri.
    const qrSrc = brCodeBase64
        ? brCodeBase64.startsWith("data:")
            ? brCodeBase64
            : `data:image/png;base64,${brCodeBase64}`
        : "";

    const expiresLabel = (() => {
        if (!expiredAt) return "";
        const d = new Date(expiredAt);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    })();

    useEffect(() => {
        if (invoiceId == null) return;
        let cancelled = false;

        const check = async () => {
            try {
                const res = await orderContext.checkPixStatus(invoiceId);
                if (cancelled) return;
                if (res?.paid === true) {
                    cancelled = true;
                    onPaid();
                }
            } catch (err: any) {
                if (!cancelled && onError) {
                    onError(err?.message || t("payment_error"));
                }
            }
        };

        check();
        const iv = window.setInterval(check, POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            window.clearInterval(iv);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoiceId]);

    const handleCopy = async () => {
        if (!brCode) return;
        try {
            await navigator.clipboard.writeText(brCode);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API unavailable — the code stays visible for manual copy.
        }
    };

    return (
        <div className="relative flex flex-col items-center text-center gap-4 py-2">
            {qrSrc && (
                <img
                    src={qrSrc}
                    alt={t("pix_qr_alt")}
                    className="w-56 h-56 rounded-lg border border-slate-200 bg-white p-2"
                />
            )}

            <p className="text-sm text-slate-500">{t("pix_scan_instruction")}</p>

            {brCode && (
                <div className="w-full">
                    <label className="block text-xs font-medium text-slate-400 mb-1 text-left">
                        {t("pix_copy_paste_label")}
                    </label>
                    <div className="flex items-stretch gap-2">
                        <input
                            type="text"
                            readOnly
                            value={brCode}
                            onFocus={(e) => e.currentTarget.select()}
                            className="flex-1 min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 font-mono truncate"
                        />
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="shrink-0 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                        >
                            {copied ? t("pix_copied") : t("pix_copy_button")}
                        </button>
                    </div>
                </div>
            )}

            {expiresLabel && (
                <p className="text-xs text-slate-400">
                    {t("pix_expires_at", { time: expiresLabel })}
                </p>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-500" aria-live="polite">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {t("pix_awaiting_payment")}
            </div>

            {invoiceId != null && (
                <button
                    type="button"
                    onClick={handleSimulate}
                    disabled={simulating}
                    aria-label="Simular pagamento PIX (dev)"
                    title="Simular pagamento PIX (dev)"
                    style={{
                        position: "absolute",
                        right: 4,
                        bottom: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        padding: 0,
                        border: 0,
                        background: "transparent",
                        color: "rgba(100, 116, 139, 0.35)",
                        fontSize: 18,
                        fontFamily: "'Times New Roman', serif",
                        fontWeight: 700,
                        lineHeight: 1,
                        cursor: simulating ? "wait" : "pointer",
                        opacity: simulating ? 0.5 : 1,
                        transition: "color .15s ease",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(100, 116, 139, 0.85)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(100, 116, 139, 0.35)";
                    }}
                >
                    π
                </button>
            )}

            <MessageToast
                dialog={toastDialog}
                showMessage={toastShow}
                messageText={toastMsg}
                onClose={() => setToastShow(false)}
            />
        </div>
    );
}
