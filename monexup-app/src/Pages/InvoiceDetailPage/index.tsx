import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, Check, Circle, Clock, Pause, X } from "lucide-react";

import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import OrderContext from "../../Contexts/Order/OrderContext";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import { InvoiceStatusEnum } from "../../DTO/Enum/InvoiceStatusEnum";
import { PaymentMethodEnum } from "../../DTO/Enum/PaymentMethodEnum";
import InvoiceInfo from "../../DTO/Domain/InvoiceInfo";

import {
    formatDateTimeShort,
    formatPrice,
    invoiceStatusPill,
    invoiceTotal,
    isValidDate,
} from "./invoiceHelpers";

/**
 * InvoiceDetailPage — `/admin/orders/:orderId/invoices/:invoiceId` route.
 *
 * Read-only 1:1 render of an InvoiceInfo. Mirrors OrderDetailPage's
 * editorial-brutalist surface and reuses the shared invoice helpers so
 * status pill / totals math stay in sync with the OrderDetailPage
 * payment card. Role gating is a frontend mirror of the backend guard.
 */

type PageState = "loading" | "ready" | "not_found" | "not_authorized" | "error";

// PaymentMethodEnum: 1=Pix, 2=Boleto, 3=CreditCard, 4=DebitCard.
function paymentMethodLabel(t: any, code: number | undefined): string {
    switch (code) {
        case PaymentMethodEnum.Pix:
            return t("invoiceDetailPage.payment_method_pix", "PIX");
        case PaymentMethodEnum.Boleto:
            return t("invoiceDetailPage.payment_method_boleto", "Boleto");
        case PaymentMethodEnum.CreditCard:
        case PaymentMethodEnum.DebitCard:
            return t("invoiceDetailPage.payment_method_card", "Cartão");
        default:
            return t("invoiceDetailPage.payment_method_other", "Outro");
    }
}

// Only PIX gets the orange pill — every other method uses the neutral chip.
function paymentMethodPillCls(code: number | undefined): string {
    if (code === PaymentMethodEnum.Pix) {
        return "bg-orange-500/10 text-orange-700 ring-orange-500/20";
    }
    return "bg-graphite-100 text-graphite-700 ring-graphite-200";
}

// Numeric-status icon — mirrors the OrderDetailPage StatusIcon so users see the
// same visual grammar across order + invoice status pills.
function InvoiceStatusIcon({ status }: { status: InvoiceStatusEnum }) {
    switch (status) {
        case InvoiceStatusEnum.Paid:
            return <Check size={12} aria-hidden="true" />;
        case InvoiceStatusEnum.Sent:
            return <Circle size={12} aria-hidden="true" />;
        case InvoiceStatusEnum.Pending:
            return <Clock size={12} aria-hidden="true" />;
        case InvoiceStatusEnum.Overdue:
            return <Pause size={12} aria-hidden="true" />;
        case InvoiceStatusEnum.Cancelled:
        case InvoiceStatusEnum.Expired:
            return <X size={12} aria-hidden="true" />;
        default:
            return <Circle size={12} aria-hidden="true" />;
    }
}

export default function InvoiceDetailPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const orderContext = useContext(OrderContext);

    const { orderId: orderIdStr, invoiceId: invoiceIdStr } = useParams<{
        orderId: string;
        invoiceId: string;
    }>();
    const orderId = Number(orderIdStr);
    const invoiceId = Number(invoiceIdStr);

    const [pageState, setPageState] = useState<PageState>("loading");
    const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const showToast = (kind: MessageToastEnum, text: string) => {
        setDialog(kind);
        setMessageText(text);
        setShowMessage(true);
    };

    const currentRole = networkContext.currentRole;
    // Session user id is unused for now — backend already owns the ownership
    // check — but we keep the reference so future frontend guards don't
    // duplicate the AuthContext lookup.
    void authContext.sessionInfo?.userId;

    // Role gating: mirror OrderDetailPage — NetworkManager / Administrator /
    // Seller / User are the four allowed roles. Backend is the source of
    // truth; the frontend guard just avoids a wasted round-trip.
    const roleAllowed = useMemo(() => {
        return (
            currentRole === UserRoleEnum.NetworkManager ||
            currentRole === UserRoleEnum.Administrator ||
            currentRole === UserRoleEnum.Seller ||
            currentRole === UserRoleEnum.User
        );
    }, [currentRole]);

    // Load ---------------------------------------------------------------
    useEffect(() => {
        if (!orderId || Number.isNaN(orderId) || !invoiceId || Number.isNaN(invoiceId)) {
            setPageState("not_found");
            return;
        }
        if (!roleAllowed) {
            setPageState("not_authorized");
            return;
        }
        setPageState("loading");
        orderContext.getInvoice(orderId, invoiceId).then((ret) => {
            if (!ret.sucesso) {
                // Distinguish backend 403/404 from generic error via a coarse
                // status-code sniff in the message so the empty state can
                // pick the right copy without a dedicated field on the DTO.
                const msg = String(ret.mensagemErro || "").toLowerCase();
                if (msg.includes("403") || msg.includes("forbidden") || msg.includes("permiss")) {
                    setPageState("not_authorized");
                    return;
                }
                if (msg.includes("404") || msg.includes("not found") || msg.includes("não encontrad")) {
                    setPageState("not_found");
                    return;
                }
                setPageState("error");
                showToast(
                    MessageToastEnum.Error,
                    ret.mensagemErro ||
                        t("invoiceDetailPage.load_error", "Não foi possível carregar a fatura."),
                );
                return;
            }
            const loaded = ret.invoice as InvoiceInfo | null;
            if (!loaded) {
                setPageState("not_found");
                return;
            }
            setInvoice(loaded);
            setPageState("ready");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, invoiceId, roleAllowed]);

    // Derived ------------------------------------------------------------
    const invoiceCode = invoice
        ? invoice.invoiceNumber || `#${invoice.invoiceId}`
        : `#${invoiceId}`;

    const items = invoice?.items ?? [];
    const itemsSubtotal = items.reduce((acc, it) => {
        const q = typeof it.quantity === "number" ? it.quantity : 0;
        const p = typeof it.unitPrice === "number" ? it.unitPrice : 0;
        const d = typeof it.discount === "number" ? it.discount : 0;
        return acc + Math.max(0, q * p - d);
    }, 0);
    const invoiceDiscount = invoice?.discount ?? 0;
    const total = invoice ? invoiceTotal(invoice) : 0;

    const statusPill = invoice
        ? invoiceStatusPill(invoice.status, t)
        : { label: "—", cls: "bg-graphite-100 text-graphite-700 ring-graphite-200" };

    // ------------------------------------------------------------------
    return (
        <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />

            <div className="max-w-container mx-auto px-shell pt-6 pb-12">
                {/* 1. Page header band ---------------------------------- */}
                <section
                    className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
                    aria-labelledby="invoice-detail-page-title"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <span
                                aria-hidden="true"
                                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
                            />
                            <h1
                                id="invoice-detail-page-title"
                                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
                            >
                                {t("invoiceDetailPage.title", { invoiceNumber: invoiceCode })}
                            </h1>
                        </div>
                        <nav aria-label="Breadcrumb" className="mt-2 ml-[14px] text-sm">
                            <ol className="flex items-center gap-1 text-graphite-500">
                                <li>
                                    <Link
                                        to="/admin/dashboard"
                                        className="hover:text-orange-600 transition-colors duration-fast"
                                    >
                                        {t("profileListPage.myNetwork")}
                                    </Link>
                                </li>
                                <li aria-hidden="true" className="text-graphite-300">
                                    <ChevronRight size={14} />
                                </li>
                                <li>
                                    <Link
                                        to="/admin/orders"
                                        className="hover:text-orange-600 transition-colors duration-fast"
                                    >
                                        {t("orderDetailPage.breadcrumb")}
                                    </Link>
                                </li>
                                <li aria-hidden="true" className="text-graphite-300">
                                    <ChevronRight size={14} />
                                </li>
                                <li>
                                    <Link
                                        to={`/admin/orders/${orderId}`}
                                        className="hover:text-orange-600 transition-colors duration-fast mnx-num tabular-nums"
                                    >
                                        #{orderId}
                                    </Link>
                                </li>
                                <li aria-hidden="true" className="text-graphite-300">
                                    <ChevronRight size={14} />
                                </li>
                                <li
                                    aria-current="page"
                                    className="font-medium text-graphite-700 truncate max-w-[14rem] mnx-num tabular-nums"
                                >
                                    {invoiceCode}
                                </li>
                            </ol>
                        </nav>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/orders/${orderId}`)}
                            className="inline-flex h-9 items-center gap-2 px-3 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            {t("invoiceDetailPage.back_button")}
                        </button>
                    </div>
                </section>

                {/* 2. Content card -------------------------------------- */}
                <section
                    aria-label={t("invoiceDetailPage.title", { invoiceNumber: invoiceCode })}
                    className="auth-card relative p-4 sm:p-6 animate-fade-up"
                >
                    {pageState === "not_authorized" && (
                        <EmptyState title={t("invoiceDetailPage.not_authorized")} body="" />
                    )}

                    {pageState === "not_found" && (
                        <EmptyState title={t("invoiceDetailPage.not_found")} body="" />
                    )}

                    {pageState === "loading" && <LoadingSkeleton />}

                    {pageState === "ready" && invoice && (
                        <div className="space-y-8">
                            {/* --- 2.1 Resumo --- */}
                            <div>
                                <h2 className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500 mb-3">
                                    {t("invoiceDetailPage.section_summary")}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4">
                                    <span
                                        className={`inline-flex items-center gap-1 h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 ${statusPill.cls}`}
                                    >
                                        <InvoiceStatusIcon status={invoice.status} />
                                        {statusPill.label}
                                    </span>

                                    <span className="text-sm font-semibold text-graphite-900 font-mono">
                                        {invoiceCode}
                                    </span>

                                    <div className="flex flex-col text-xs text-graphite-500">
                                        {isValidDate(invoice.paidAt) && (
                                            <span>
                                                <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400 mr-2">
                                                    {t("invoiceDetailPage.label_paid_at")}
                                                </span>
                                                <span className="text-graphite-700 mnx-num tabular-nums">
                                                    {formatDateTimeShort(invoice.paidAt)}
                                                </span>
                                            </span>
                                        )}
                                        <span>
                                            <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400 mr-2">
                                                {t("invoiceDetailPage.label_due_date")}
                                            </span>
                                            <span className="text-graphite-700 mnx-num tabular-nums">
                                                {isValidDate(invoice.dueDate)
                                                    ? formatDateTimeShort(invoice.dueDate)
                                                    : "—"}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                            {t("invoiceDetailPage.label_payment_method")}
                                        </span>
                                        <span
                                            className={`inline-flex items-center h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 ${paymentMethodPillCls(invoice.paymentMethod)}`}
                                        >
                                            {paymentMethodLabel(t, invoice.paymentMethod)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* --- 2.2 Metadados --- */}
                            <div>
                                <h2 className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500 mb-3">
                                    {t("invoiceDetailPage.section_meta")}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Left dl — system dates + external code */}
                                    <dl className="rounded-xl border border-mnx-neutral-200 bg-white p-4 space-y-3">
                                        <div className="grid grid-cols-[9rem_1fr] gap-3 items-baseline">
                                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_created_at")}
                                            </dt>
                                            <dd className="text-sm text-graphite-900 mnx-num tabular-nums">
                                                {isValidDate(invoice.createdAt)
                                                    ? formatDateTimeShort(invoice.createdAt)
                                                    : "—"}
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-[9rem_1fr] gap-3 items-baseline">
                                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_updated_at")}
                                            </dt>
                                            <dd className="text-sm text-graphite-900 mnx-num tabular-nums">
                                                {isValidDate(invoice.updatedAt)
                                                    ? formatDateTimeShort(invoice.updatedAt)
                                                    : "—"}
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-[9rem_1fr] gap-3 items-baseline">
                                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_expires_at")}
                                            </dt>
                                            <dd className="text-sm text-graphite-900 mnx-num tabular-nums">
                                                {isValidDate(invoice.expiresAt)
                                                    ? formatDateTimeShort(invoice.expiresAt)
                                                    : "—"}
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-[9rem_1fr] gap-3 items-baseline">
                                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_external_code")}
                                            </dt>
                                            <dd className="text-sm text-graphite-900 font-mono truncate">
                                                {invoice.externalCode || "—"}
                                            </dd>
                                        </div>
                                    </dl>

                                    {/* Right dl — business state + totals */}
                                    <dl className="rounded-xl border border-mnx-neutral-200 bg-white p-4 space-y-3">
                                        <div className="grid grid-cols-[9rem_1fr] gap-3 items-baseline">
                                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_status")}
                                            </dt>
                                            <dd className="text-sm text-graphite-900">{statusPill.label}</dd>
                                        </div>
                                        <div className="grid grid-cols-[9rem_1fr] gap-3 items-baseline">
                                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_payment_method")}
                                            </dt>
                                            <dd className="text-sm text-graphite-900">
                                                {paymentMethodLabel(t, invoice.paymentMethod)}
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-[9rem_1fr] gap-3 items-baseline">
                                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_invoice_discount")}
                                            </dt>
                                            <dd className="text-sm text-graphite-900 mnx-num tabular-nums">
                                                <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                {formatPrice(invoiceDiscount)}
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-[9rem_1fr] gap-3 items-baseline border-t border-mnx-neutral-100 pt-3">
                                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_total")}
                                            </dt>
                                            <dd className="text-[15px] font-semibold text-graphite-900 mnx-num tabular-nums">
                                                <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                {formatPrice(total)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* --- 2.3 Itens --- */}
                            <div>
                                <h2 className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500 mb-3">
                                    {t("invoiceDetailPage.section_items")}
                                </h2>
                                <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
                                    {/* Desktop column headers — 5/2/2/1/2 = 12 */}
                                    <div
                                        className="hidden md:!grid grid-cols-12 gap-4 px-4 h-11 items-center bg-mnx-neutral-50 border-b border-mnx-neutral-200"
                                        role="row"
                                    >
                                        <div className="col-span-5 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("invoiceDetailPage.label_description")}
                                        </div>
                                        <div className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("invoiceDetailPage.label_quantity")}
                                        </div>
                                        <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("invoiceDetailPage.label_unit_price")}
                                        </div>
                                        <div className="col-span-1 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("invoiceDetailPage.label_item_discount")}
                                        </div>
                                        <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("invoiceDetailPage.label_subtotal")}
                                        </div>
                                    </div>

                                    <div role="rowgroup">
                                        {items.map((it) => {
                                            const qty = typeof it.quantity === "number" ? it.quantity : 0;
                                            const unit = typeof it.unitPrice === "number" ? it.unitPrice : 0;
                                            const disc = typeof it.discount === "number" ? it.discount : 0;
                                            const sub = Math.max(0, qty * unit - disc);
                                            return (
                                                <div key={it.invoiceItemId}>
                                                    {/* Desktop row */}
                                                    <div
                                                        className="hidden md:!grid grid-cols-12 gap-4 items-center px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
                                                        role="row"
                                                    >
                                                        <div className="col-span-5 min-w-0">
                                                            <div className="text-sm font-semibold text-graphite-900 truncate">
                                                                {it.description || "—"}
                                                            </div>
                                                            <div className="text-[11px] text-graphite-500 truncate font-mono">
                                                                item-{it.invoiceItemId}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="inline-flex items-center h-[24px] px-2 rounded-full bg-graphite-100 text-graphite-700 ring-1 ring-graphite-200 text-[11px] font-semibold">
                                                                {qty}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-2 text-right text-sm text-graphite-900 mnx-num tabular-nums">
                                                            <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                            {formatPrice(unit)}
                                                        </div>
                                                        <div className="col-span-1 text-right text-sm text-graphite-900 mnx-num tabular-nums">
                                                            <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                            {formatPrice(disc)}
                                                        </div>
                                                        <div className="col-span-2 text-right text-sm font-semibold text-graphite-900 mnx-num tabular-nums">
                                                            <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                            {formatPrice(sub)}
                                                        </div>
                                                    </div>

                                                    {/* Mobile card */}
                                                    <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4">
                                                        <div className="text-sm font-semibold text-graphite-900">
                                                            {it.description || "—"}
                                                        </div>
                                                        <div className="text-[11px] text-graphite-500 font-mono">
                                                            item-{it.invoiceItemId}
                                                        </div>
                                                        <dl className="mt-3 grid grid-cols-3 gap-3">
                                                            <div>
                                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                                    {t("invoiceDetailPage.label_quantity")}
                                                                </dt>
                                                                <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums">
                                                                    {qty}
                                                                </dd>
                                                            </div>
                                                            <div>
                                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                                    {t("invoiceDetailPage.label_unit_price")}
                                                                </dt>
                                                                <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums">
                                                                    <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                                    {formatPrice(unit)}
                                                                </dd>
                                                            </div>
                                                            <div>
                                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                                    {t("invoiceDetailPage.label_subtotal")}
                                                                </dt>
                                                                <dd className="mt-0.5 text-sm font-semibold text-graphite-900 mnx-num tabular-nums">
                                                                    <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                                    {formatPrice(sub)}
                                                                </dd>
                                                            </div>
                                                        </dl>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Totals footer inside table shell */}
                                    <div className="border-t border-mnx-neutral-200 bg-mnx-neutral-50 px-4 py-3">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_subtotal")}
                                            </span>
                                            <span className="text-sm text-graphite-900 mnx-num tabular-nums w-28 text-right">
                                                <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                {formatPrice(itemsSubtotal)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-3 mt-1">
                                            <span className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_invoice_discount")}
                                            </span>
                                            <span className="text-sm text-graphite-900 mnx-num tabular-nums w-28 text-right">
                                                <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                {formatPrice(invoiceDiscount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-3 mt-1 border-t border-mnx-neutral-200 pt-2">
                                            <span className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                                {t("invoiceDetailPage.label_total")}
                                            </span>
                                            <span className="text-[15px] font-semibold text-graphite-900 mnx-num tabular-nums w-28 text-right">
                                                <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- 2.4 Notas (conditional) --- */}
                            {invoice.notes?.trim() && (
                                <div className="border border-mnx-neutral-200 rounded-xl p-4 bg-mnx-neutral-50">
                                    <div className="text-[11px] uppercase tracking-wider font-semibold text-graphite-500 mb-2">
                                        {t("invoiceDetailPage.section_notes")}
                                    </div>
                                    <p className="text-sm text-graphite-700 whitespace-pre-line leading-relaxed">
                                        {invoice.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <div className="px-6 py-14 text-center">
            <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                {title}
            </h3>
            {body && (
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                    {body}
                </p>
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div aria-busy="true" className="space-y-8">
            {/* Summary strip */}
            <div>
                <Skeleton className="h-3 w-24 mb-3" />
                <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>

            {/* Meta grid — two dl blocks */}
            <div>
                <Skeleton className="h-3 w-24 mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-mnx-neutral-200 bg-white p-4 space-y-3">
                        <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Skeleton className="h-3" />
                            <Skeleton className="h-3" />
                        </div>
                        <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Skeleton className="h-3" />
                            <Skeleton className="h-3" />
                        </div>
                        <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Skeleton className="h-3" />
                            <Skeleton className="h-3" />
                        </div>
                        <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Skeleton className="h-3" />
                            <Skeleton className="h-3" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-mnx-neutral-200 bg-white p-4 space-y-3">
                        <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Skeleton className="h-3" />
                            <Skeleton className="h-3" />
                        </div>
                        <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Skeleton className="h-3" />
                            <Skeleton className="h-3" />
                        </div>
                        <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Skeleton className="h-3" />
                            <Skeleton className="h-3" />
                        </div>
                        <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Skeleton className="h-4" />
                            <Skeleton className="h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Items skeleton rows */}
            <div>
                <Skeleton className="h-3 w-24 mb-3" />
                <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="hidden md:!grid grid-cols-12 gap-4 items-center px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0"
                        >
                            <div className="col-span-5 space-y-1.5">
                                <Skeleton className="h-3 w-2/3" />
                                <Skeleton className="h-2.5 w-1/3" />
                            </div>
                            <Skeleton className="col-span-2 h-5 w-10 rounded-full" />
                            <Skeleton className="col-span-2 h-3 ml-auto w-20" />
                            <Skeleton className="col-span-1 h-3 ml-auto w-14" />
                            <Skeleton className="col-span-2 h-3 ml-auto w-20" />
                        </div>
                    ))}
                    <div className="border-t border-mnx-neutral-200 bg-mnx-neutral-50 px-4 py-3 space-y-1.5">
                        <Skeleton className="h-3 w-40 ml-auto" />
                        <Skeleton className="h-3 w-40 ml-auto" />
                        <Skeleton className="h-4 w-48 ml-auto" />
                    </div>
                </div>
            </div>

            {/* Notes skeleton */}
            <div className="border border-mnx-neutral-200 rounded-xl p-4 bg-mnx-neutral-50">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-3 w-full mb-1.5" />
                <Skeleton className="h-3 w-11/12 mb-1.5" />
                <Skeleton className="h-3 w-3/4" />
            </div>
        </div>
    );
}
