import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Check,
    ChevronRight,
    Circle,
    Clock,
    Pause,
    Pencil,
    X,
} from "lucide-react";

import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import OrderContext from "../../Contexts/Order/OrderContext";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { OrderStatusEnum } from "../../DTO/Enum/OrderStatusEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import OrderInfo from "../../DTO/Domain/OrderInfo";

import StatusChangeModal from "./StatusChangeModal";
import {
    formatDateTimeShort,
    formatPrice,
    invoiceStatusPill,
    invoiceTotal,
    isValidDate,
    InvoiceLike,
} from "../InvoiceDetailPage/invoiceHelpers";

/**
 * OrderDetailPage — `/admin/orders/:orderId` route.
 *
 * Mirrors the editorial-brutalist admin surface used by EditAccountPage /
 * OrderSearchPage. Loads a single order via `orderContext.getById`, gates
 * access by role + ownership, and exposes a status-change modal that calls
 * `orderContext.update`. `proxyPayInvoiceId` arrives from the backend but is
 * not on the OrderInfo type — read via a narrow cast in the payment block.
 */

type PageState = "loading" | "ready" | "error" | "not_found" | "not_authorized";

function statusPillClass(s: OrderStatusEnum): string {
    switch (s) {
        case OrderStatusEnum.Active:
            return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20";
        case OrderStatusEnum.Suspended:
            return "bg-amber-500/10 text-amber-700 ring-amber-500/20";
        case OrderStatusEnum.Finished:
            return "bg-graphite-100 text-graphite-700 ring-graphite-200";
        case OrderStatusEnum.Expired:
            return "bg-rose-500/10 text-rose-700 ring-rose-500/20";
        case OrderStatusEnum.Incoming:
            return "bg-sky-500/10 text-sky-700 ring-sky-500/20";
        default:
            return "bg-graphite-100 text-graphite-700 ring-graphite-200";
    }
}

function StatusIcon({ status }: { status: OrderStatusEnum }) {
    switch (status) {
        case OrderStatusEnum.Active:
            return <Check size={12} aria-hidden="true" />;
        case OrderStatusEnum.Finished:
            return <Circle size={12} aria-hidden="true" />;
        case OrderStatusEnum.Suspended:
            return <Pause size={12} aria-hidden="true" />;
        case OrderStatusEnum.Expired:
            return <X size={12} aria-hidden="true" />;
        case OrderStatusEnum.Incoming:
            return <Clock size={12} aria-hidden="true" />;
        default:
            return <Circle size={12} aria-hidden="true" />;
    }
}

function getInitials(name: string | undefined): string {
    if (!name) return "—";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "—";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function itemSubtotal(item: OrderInfo["items"][number]): number {
    // Prefer the snapshotted amount when the backend saved it (donations set
    // this at insert-time). Fall back to product.price × quantity for legacy
    // orders where Amount was not persisted.
    if (typeof item.amount === "number" && isFinite(item.amount) && item.amount > 0) {
        return item.amount;
    }
    const price = item.product?.price ?? 0;
    return price * item.quantity;
}

function itemUnitPrice(item: OrderInfo["items"][number]): number {
    // Show the effective per-unit paid amount. For open-donations product.price
    // is 0 while item.amount carries the buyer-typed value → derive.
    const price = item.product?.price ?? 0;
    if (price > 0) return price;
    if (typeof item.amount === "number" && isFinite(item.amount) && item.amount > 0) {
        return item.quantity > 0 ? item.amount / item.quantity : item.amount;
    }
    return 0;
}

// Product type / frequency label helpers — mirrored from ProductSearchPage.
// Codes: productType 1=Physical, 2=InfoProduct, 3=Donation.
function productTypeLabel(t: any, code: number | undefined): string {
    switch (code) {
        case 1: return t("admin_product_type_physical", "Físico");
        case 2: return t("admin_product_type_infoproduct", "Infoproduto");
        case 3: return t("admin_product_type_donation", "Doação");
        default: return "—";
    }
}
// Frequency stored in days (1 / 7 / 30 / 60 / 90 / 150 / 365).
function frequencyLabel(t: any, code: number | undefined | null): string {
    switch (code) {
        case 1: return t("admin_product_frequency_once", "Apenas uma vez");
        case 7: return t("admin_product_frequency_weekly", "Semanal");
        case 30: return t("admin_product_frequency_monthly", "Mensal");
        case 60: return t("admin_product_frequency_bimonthly", "Bimestral");
        case 90: return t("admin_product_frequency_quarterly", "Trimestral");
        case 150: return t("admin_product_frequency_biannual", "Semestral");
        case 365: return t("admin_product_frequency_annual", "Anual");
        default: return "";
    }
}

export default function OrderDetailPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const orderContext = useContext(OrderContext);

    const { orderId: orderIdStr } = useParams<{ orderId: string }>();
    const orderId = Number(orderIdStr);

    const [pageState, setPageState] = useState<PageState>("loading");
    const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const showToast = (kind: MessageToastEnum, text: string) => {
        setDialog(kind);
        setMessageText(text);
        setShowMessage(true);
    };

    const order = orderContext.order;
    const loading = orderContext.loading;
    const loadingUpdate = orderContext.loadingUpdate;

    // Role gating up-front: reject roles not in the allowlist before
    // firing the fetch — mirrors OrderSearchPage's allowlist verbatim.
    const currentRole = networkContext.currentRole;
    const sessionUserId = authContext.sessionInfo?.userId;

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
        if (!orderId || Number.isNaN(orderId)) {
            setPageState("not_found");
            return;
        }
        if (!roleAllowed) {
            setPageState("not_authorized");
            return;
        }
        setPageState("loading");
        orderContext.getById(orderId).then((ret) => {
            if (!ret.sucesso) {
                setPageState("error");
                showToast(
                    MessageToastEnum.Error,
                    ret.mensagemErro || t("orderDetailPage.load_error", "Não foi possível carregar a assinatura."),
                );
                return;
            }
            const loaded = ret.order;
            if (!loaded) {
                setPageState("not_found");
                return;
            }
            // Ownership check for restricted roles.
            if (
                currentRole === UserRoleEnum.Seller &&
                loaded.sellerId !== sessionUserId
            ) {
                setPageState("not_authorized");
                return;
            }
            if (
                currentRole === UserRoleEnum.User &&
                loaded.userId !== sessionUserId
            ) {
                setPageState("not_authorized");
                return;
            }
            setPageState("ready");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, roleAllowed]);

    // Formatters ---------------------------------------------------------
    const formatDate = (iso?: string): string => {
        if (!iso) return "—";
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return "—";
            return new Intl.DateTimeFormat(i18n.language || "pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(d);
        } catch {
            return "—";
        }
    };

    const statusLabel = (s: OrderStatusEnum): string => {
        switch (s) {
            case OrderStatusEnum.Incoming:
                return t("order_status_incoming");
            case OrderStatusEnum.Active:
                return t("order_status_active");
            case OrderStatusEnum.Suspended:
                return t("order_status_suspended");
            case OrderStatusEnum.Finished:
                return t("order_status_finished");
            case OrderStatusEnum.Expired:
                return t("order_status_expired");
            default:
                return "";
        }
    };

    // Status change ------------------------------------------------------
    const handleStatusSubmit = async (newStatus: OrderStatusEnum) => {
        if (!order) return;
        const updated: OrderInfo = { ...order, status: newStatus };
        const ret = await orderContext.update(updated);
        if (ret.sucesso) {
            setStatusModalOpen(false);
            showToast(
                MessageToastEnum.Success,
                t("orderDetailPage.change_status_success", "Status atualizado com sucesso."),
            );
            // Refresh from the source of truth so the summary strip and any
            // computed fields reflect the backend's canonical state.
            orderContext.getById(orderId);
        } else {
            showToast(
                MessageToastEnum.Error,
                ret.mensagemErro ||
                    t("orderDetailPage.change_status_error", "Não foi possível atualizar o status."),
            );
        }
    };

    // Derived ------------------------------------------------------------
    const orderCode = order
        ? "#" + String(order.orderId).padStart(6, "0")
        : `#${orderId}`;
    const total = order?.items?.reduce((acc, it) => acc + itemSubtotal(it), 0) ?? 0;
    const proxyPayInvoiceId = order ? (order as any).proxyPayInvoiceId : null;

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
                    aria-labelledby="order-detail-page-title"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <span
                                aria-hidden="true"
                                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
                            />
                            <h1
                                id="order-detail-page-title"
                                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
                            >
                                {t("orderDetailPage.title", { orderId })}
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
                                <li
                                    aria-current="page"
                                    className="font-medium text-graphite-700 truncate max-w-[14rem] mnx-num tabular-nums"
                                >
                                    #{orderId}
                                </li>
                            </ol>
                        </nav>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/orders")}
                            className="inline-flex h-9 items-center gap-2 px-3 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            {t("orderDetailPage.back_button")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusModalOpen(true)}
                            disabled={!order || loadingUpdate || pageState !== "ready"}
                            className="cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Pencil size={16} aria-hidden="true" />
                            {t("orderDetailPage.change_status_button")}
                        </button>
                    </div>
                </section>

                {/* 2. Content card -------------------------------------- */}
                <section
                    aria-label={t("orderDetailPage.title", { orderId })}
                    className="auth-card relative p-4 sm:p-6 animate-fade-up"
                >
                    {pageState === "not_authorized" && (
                        <EmptyState
                            title={t("orderDetailPage.not_authorized")}
                            body=""
                        />
                    )}

                    {pageState === "not_found" && (
                        <EmptyState
                            title={t("orderDetailPage.not_found")}
                            body=""
                        />
                    )}

                    {(pageState === "loading" || loading) && pageState !== "not_authorized" && pageState !== "not_found" && (
                        <LoadingSkeleton />
                    )}

                    {pageState === "ready" && order && !loading && (
                        <div className="space-y-8">
                            {/* --- Resumo --- */}
                            <div>
                                <h2 className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500 mb-3">
                                    {t("orderDetailPage.section_summary")}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4">
                                    <span
                                        className={`inline-flex items-center gap-1 h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 ${statusPillClass(order.status)}`}
                                    >
                                        <StatusIcon status={order.status} />
                                        {statusLabel(order.status)}
                                    </span>
                                    <span className="text-sm font-semibold text-graphite-900 mnx-num tabular-nums">
                                        {orderCode}
                                    </span>
                                    <div className="flex flex-col text-xs text-graphite-500">
                                        <span>
                                            <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400 mr-2">
                                                {t("orderDetailPage.label_createdAt")}
                                            </span>
                                            <span className="text-graphite-700 mnx-num tabular-nums">
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </span>
                                        <span>
                                            <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400 mr-2">
                                                {t("orderDetailPage.label_updatedAt")}
                                            </span>
                                            <span className="text-graphite-700 mnx-num tabular-nums">
                                                {formatDate(order.updatedAt)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* --- Comprador + Vendedor lado-a-lado --- */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h2 className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500 mb-3">
                                        {t("orderDetailPage.section_buyer")}
                                    </h2>
                                    <PartyCard user={order.user} t={t} alignRight={false} />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500 mb-3">
                                        {t("orderDetailPage.section_seller", "Vendedor")}
                                    </h2>
                                    {order.seller ? (
                                        <PartyCard user={order.seller} t={t} alignRight={true} />
                                    ) : (
                                        <div className="text-sm italic text-graphite-500">
                                            {t("orderDetailPage.seller_missing", "Sem vendedor associado")}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- Produtos --- */}
                            <div>
                                <h2 className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500 mb-3">
                                    {t("orderDetailPage.section_products")}
                                </h2>
                                <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
                                    {/* Desktop column headers — 3/2/2/1/2/2 = 12 */}
                                    <div
                                        className="hidden md:!grid grid-cols-12 gap-4 px-4 h-11 items-center bg-mnx-neutral-50 border-b border-mnx-neutral-200"
                                        role="row"
                                    >
                                        <div className="col-span-3 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("orderDetailPage.section_products")}
                                        </div>
                                        <div className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("orderDetailPage.label_type", "Tipo")}
                                        </div>
                                        <div className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("orderDetailPage.label_frequency", "Frequência")}
                                        </div>
                                        <div className="col-span-1 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("orderDetailPage.label_quantity")}
                                        </div>
                                        <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("orderDetailPage.label_unit_price")}
                                        </div>
                                        <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                            {t("orderDetailPage.label_subtotal")}
                                        </div>
                                    </div>

                                    <div role="rowgroup">
                                        {order.items?.map((it) => {
                                            const unitPrice = itemUnitPrice(it);
                                            const typeText = productTypeLabel(t, (it.product as any)?.productType as number | undefined);
                                            const freqText = frequencyLabel(t, (it.product as any)?.frequency as number | null | undefined);
                                            const sub = itemSubtotal(it);
                                            const thumb =
                                                it.product?.imageUrl ||
                                                it.product?.images?.[0]?.imageUrl ||
                                                "";
                                            return (
                                                <div key={it.itemId}>
                                                    {/* Desktop row */}
                                                    <div
                                                        className="hidden md:!grid grid-cols-12 gap-4 items-center px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
                                                        role="row"
                                                    >
                                                        <div className="col-span-3 min-w-0 flex items-center gap-3">
                                                            {thumb ? (
                                                                <img
                                                                    src={thumb}
                                                                    alt=""
                                                                    className="w-8 h-8 rounded-md object-cover ring-1 ring-graphite-100 shrink-0 bg-graphite-50"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <span
                                                                    aria-hidden="true"
                                                                    className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-graphite-100 text-graphite-500 ring-1 ring-graphite-200 text-[0.7rem] font-bold shrink-0"
                                                                >
                                                                    {getInitials(it.product?.name)}
                                                                </span>
                                                            )}
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-semibold text-graphite-900 truncate">
                                                                    {it.product?.name || "—"}
                                                                </div>
                                                                {it.product?.slug && (
                                                                    <div className="text-[11px] text-graphite-500 truncate font-mono">
                                                                        {it.product.slug}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="inline-flex items-center h-[24px] px-2 rounded-full bg-graphite-100 text-graphite-700 ring-1 ring-graphite-200 text-[11px] font-semibold truncate max-w-full">
                                                                {typeText}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            {freqText ? (
                                                                <span className="inline-flex items-center h-[24px] px-2 rounded-full bg-graphite-100 text-graphite-700 ring-1 ring-graphite-200 text-[11px] font-semibold truncate max-w-full">
                                                                    {freqText}
                                                                </span>
                                                            ) : (
                                                                <span className="text-graphite-400 text-[11px]">—</span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-1">
                                                            <span className="inline-flex items-center h-[24px] px-2 rounded-full bg-graphite-100 text-graphite-700 ring-1 ring-graphite-200 text-[11px] font-semibold">
                                                                {it.quantity}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-2 text-right text-sm text-graphite-900 mnx-num tabular-nums">
                                                            <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                            {formatPrice(unitPrice)}
                                                        </div>
                                                        <div className="col-span-2 text-right text-sm font-semibold text-graphite-900 mnx-num tabular-nums">
                                                            <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                            {formatPrice(sub)}
                                                        </div>
                                                    </div>

                                                    {/* Mobile card */}
                                                    <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4">
                                                        <div className="flex items-start gap-3">
                                                            {thumb ? (
                                                                <img
                                                                    src={thumb}
                                                                    alt=""
                                                                    className="w-10 h-10 rounded-md object-cover ring-1 ring-graphite-100 shrink-0 bg-graphite-50"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <span
                                                                    aria-hidden="true"
                                                                    className="inline-flex w-10 h-10 items-center justify-center rounded-md bg-graphite-100 text-graphite-500 ring-1 ring-graphite-200 text-xs font-bold shrink-0"
                                                                >
                                                                    {getInitials(it.product?.name)}
                                                                </span>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-sm font-semibold text-graphite-900 truncate">
                                                                    {it.product?.name || "—"}
                                                                </div>
                                                                {it.product?.slug && (
                                                                    <div className="text-[11px] text-graphite-500 truncate font-mono">
                                                                        {it.product.slug}
                                                                    </div>
                                                                )}
                                                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                                                    <span className="inline-flex items-center h-[20px] px-2 rounded-full bg-graphite-100 text-graphite-700 ring-1 ring-graphite-200 text-[10px] font-semibold">
                                                                        {typeText}
                                                                    </span>
                                                                    {freqText && (
                                                                        <span className="inline-flex items-center h-[20px] px-2 rounded-full bg-graphite-100 text-graphite-700 ring-1 ring-graphite-200 text-[10px] font-semibold">
                                                                            {freqText}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <dl className="mt-3 grid grid-cols-3 gap-3">
                                                            <div>
                                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                                    {t("orderDetailPage.label_quantity")}
                                                                </dt>
                                                                <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums">
                                                                    {it.quantity}
                                                                </dd>
                                                            </div>
                                                            <div>
                                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                                    {t("orderDetailPage.label_unit_price")}
                                                                </dt>
                                                                <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums">
                                                                    <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                                    {formatPrice(unitPrice)}
                                                                </dd>
                                                            </div>
                                                            <div>
                                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                                    {t("orderDetailPage.label_subtotal")}
                                                                </dt>
                                                                <dd className="mt-0.5 text-sm text-graphite-900 font-semibold mnx-num tabular-nums">
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
                                </div>

                                {/* Totals footer */}
                                <div className="flex items-center justify-end gap-3 border-t border-mnx-neutral-200 pt-3 mt-3">
                                    <span className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                        {t("orderDetailPage.label_total")}
                                    </span>
                                    <span className="text-[15px] font-semibold text-graphite-900 mnx-num tabular-nums">
                                        <span className="text-graphite-400 font-normal mr-1">R$</span>
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            </div>

                        </div>
                    )}
                </section>

                {/* 3. Payment card (invoices) --------------------------- */}
                {pageState === "ready" && order && !loading && (
                    <PaymentCard
                        proxyPayInvoiceId={proxyPayInvoiceId}
                        total={total}
                        orderId={orderId}
                        t={t}
                        formatDate={formatDate}
                    />
                )}
            </div>

            {order && (
                <StatusChangeModal
                    show={statusModalOpen}
                    currentStatus={order.status}
                    submitting={loadingUpdate}
                    onClose={() => setStatusModalOpen(false)}
                    onSubmit={handleStatusSubmit}
                />
            )}
        </main>
    );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Payment card + invoices list                                               */
/* -------------------------------------------------------------------------- */

// Local alias so the `InvoiceRow` name used throughout the PaymentCard code
// still resolves after the shared helper move.
type InvoiceRow = InvoiceLike;

function PaymentCard({
    proxyPayInvoiceId,
    total,
    orderId,
    t,
    formatDate,
}: {
    proxyPayInvoiceId: number | null | undefined;
    total: number;
    orderId: number;
    t: any;
    formatDate: (iso?: string) => string;
}) {
    const orderContext = useContext(OrderContext);
    const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState<boolean>(true);
    const [invoicesError, setInvoicesError] = useState<string>("");

    useEffect(() => {
        // Fetch invoices tied to this order via the standard http client.
        let cancelled = false;
        setInvoicesLoading(true);
        setInvoicesError("");
        orderContext
            .listInvoices(orderId)
            .then((ret) => {
                if (cancelled) return;
                if (!ret.sucesso) {
                    setInvoicesError(ret.mensagemErro || "Error");
                    return;
                }
                const arr: InvoiceRow[] = Array.isArray(ret.invoices)
                    ? ret.invoices
                    : [];
                arr.sort((a, b) => {
                    const ta = new Date(a.createdAt || a.dueDate || 0).getTime();
                    const tb = new Date(b.createdAt || b.dueDate || 0).getTime();
                    return tb - ta;
                });
                setInvoices(arr);
            })
            .catch(() => {
                if (!cancelled) setInvoicesError("Error");
            })
            .finally(() => {
                if (!cancelled) setInvoicesLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    return (
        <section
            aria-label={t("orderDetailPage.section_payment")}
            className="auth-card relative p-4 sm:p-6 animate-fade-up mt-6"
        >
            <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                    {t("orderDetailPage.section_payment")}
                </h2>
                <div className="flex items-center gap-6">
                    <dl className="flex items-center gap-2">
                        <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                            {t("orderDetailPage.label_invoice_id")}
                        </dt>
                        <dd className="text-sm text-graphite-900">
                            {proxyPayInvoiceId ? (
                                <span className="font-mono mnx-num tabular-nums">
                                    #{proxyPayInvoiceId}
                                </span>
                            ) : (
                                <span className="italic text-graphite-500">
                                    {t("orderDetailPage.label_invoice_missing")}
                                </span>
                            )}
                        </dd>
                    </dl>
                    <dl className="flex items-center gap-2">
                        <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                            {t("orderDetailPage.label_total")}
                        </dt>
                        <dd className="text-sm font-semibold text-graphite-900 mnx-num tabular-nums">
                            <span className="text-graphite-400 font-normal mr-1">R$</span>
                            {formatPrice(total)}
                        </dd>
                    </dl>
                </div>
            </div>

            <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
                {/* Header */}
                <div
                    className="hidden md:!grid grid-cols-12 gap-4 px-4 h-11 items-center bg-mnx-neutral-50 border-b border-mnx-neutral-200"
                    role="row"
                >
                    <div className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                        {t("orderDetailPage.label_invoice_number", "Nº fatura")}
                    </div>
                    <div className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                        {t("orderDetailPage.label_due_date", "Vencimento")}
                    </div>
                    <div className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                        {t("orderDetailPage.label_paid_at", "Pago em")}
                    </div>
                    <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                        {t("orderDetailPage.label_discount", "Desconto")}
                    </div>
                    <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                        {t("orderDetailPage.label_amount", "Valor")}
                    </div>
                    <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                        {t("orderDetailPage.label_status", "Status")}
                    </div>
                </div>

                {invoicesLoading && (
                    <div className="px-4 py-6" aria-busy="true">
                        {[0, 1].map((i) => (
                            <div key={i} className="hidden md:!grid grid-cols-12 gap-4 items-center h-10">
                                <Skeleton className="col-span-2 h-4" />
                                <Skeleton className="col-span-2 h-4" />
                                <Skeleton className="col-span-2 h-4" />
                                <Skeleton className="col-span-2 h-4 ml-auto w-20" />
                                <Skeleton className="col-span-2 h-4 ml-auto w-20" />
                                <Skeleton className="col-span-2 h-5 ml-auto w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                )}

                {!invoicesLoading && invoicesError && (
                    <div className="px-4 py-8 text-center text-sm text-graphite-500">
                        {t("orderDetailPage.invoices_load_error", "Não foi possível carregar as faturas.")}
                    </div>
                )}

                {!invoicesLoading && !invoicesError && invoices.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-graphite-500">
                        {t("orderDetailPage.invoices_empty", "Nenhuma fatura para esta assinatura.")}
                    </div>
                )}

                {!invoicesLoading && !invoicesError && invoices.length > 0 && (
                    <div role="rowgroup">
                        {invoices.map((inv) => {
                            const pill = invoiceStatusPill(inv.status, t);
                            const invTotal = invoiceTotal(inv);
                            const dueText = isValidDate(inv.dueDate) ? formatDateTimeShort(inv.dueDate!) : "—";
                            const paidText = isValidDate(inv.paidAt) ? formatDateTimeShort(inv.paidAt!) : "—";
                            return (
                                <Link
                                    key={inv.invoiceId}
                                    to={`/admin/orders/${orderId}/invoices/${inv.invoiceId}`}
                                    className="block"
                                    aria-label={t("orderSearchPage.viewDetails", "Ver detalhes")}
                                >
                                    {/* Desktop row */}
                                    <div
                                        className="hidden md:!grid grid-cols-12 gap-4 items-center px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast cursor-pointer"
                                        role="row"
                                    >
                                        <div className="col-span-2 text-sm font-semibold text-graphite-900 font-mono truncate">
                                            {inv.invoiceNumber || `#${inv.invoiceId}`}
                                        </div>
                                        <div className="col-span-2 text-sm text-graphite-700 mnx-num tabular-nums">
                                            {dueText}
                                        </div>
                                        <div className="col-span-2 text-sm text-graphite-700 mnx-num tabular-nums">
                                            {paidText}
                                        </div>
                                        <div className="col-span-2 text-right text-sm text-graphite-900 mnx-num tabular-nums">
                                            <span className="text-graphite-400 font-normal mr-1">R$</span>
                                            {formatPrice(inv.discount ?? 0)}
                                        </div>
                                        <div className="col-span-2 text-right text-sm font-semibold text-graphite-900 mnx-num tabular-nums">
                                            <span className="text-graphite-400 font-normal mr-1">R$</span>
                                            {formatPrice(invTotal)}
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end">
                                            <span
                                                className={`inline-flex items-center h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 ${pill.cls}`}
                                            >
                                                {pill.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mobile card */}
                                    <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-graphite-900 font-mono">
                                                    {inv.invoiceNumber || `#${inv.invoiceId}`}
                                                </div>
                                                <div className="text-[11px] text-graphite-500 mnx-num tabular-nums">
                                                    {dueText}
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 ${pill.cls}`}
                                            >
                                                {pill.label}
                                            </span>
                                        </div>
                                        <dl className="mt-3 grid grid-cols-3 gap-3">
                                            <div>
                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                    {t("orderDetailPage.label_paid_at", "Pago em")}
                                                </dt>
                                                <dd className="mt-0.5 text-sm text-graphite-700 mnx-num tabular-nums">
                                                    {paidText}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                    {t("orderDetailPage.label_discount", "Desconto")}
                                                </dt>
                                                <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums">
                                                    <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                    {formatPrice(inv.discount ?? 0)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                    {t("orderDetailPage.label_amount", "Valor")}
                                                </dt>
                                                <dd className="mt-0.5 text-sm font-semibold text-graphite-900 mnx-num tabular-nums">
                                                    <span className="text-graphite-400 font-normal mr-1">R$</span>
                                                    {formatPrice(invTotal)}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

function PartyCard({
    user,
    t,
    alignRight,
}: {
    user: OrderInfo["user"] | undefined;
    t: any;
    alignRight: boolean;
}) {
    // Same visual as the buyer avatar+meta block. `alignRight` flips the row
    // direction so the seller cluster reads right-to-left on md+.
    return (
        <div className={`flex items-start gap-4 ${alignRight ? "flex-row-reverse text-right" : ""}`}>
            {user?.imageUrl ? (
                <img
                    src={user.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-graphite-100 shrink-0 bg-graphite-50"
                    loading="lazy"
                />
            ) : (
                <span
                    aria-hidden="true"
                    className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-graphite-100 text-graphite-500 ring-1 ring-graphite-200 text-xs font-bold shrink-0"
                >
                    {getInitials(user?.name)}
                </span>
            )}
            <div className="min-w-0">
                <div className="text-sm font-semibold text-graphite-900 truncate">
                    {user?.name || "—"}
                </div>
                {user?.email && (
                    <div className="text-[11px] text-graphite-500 truncate font-mono">
                        {user.email}
                    </div>
                )}
                {user?.idDocument && (
                    <dl className={`mt-2 flex items-center gap-2 ${alignRight ? "justify-end" : ""}`}>
                        <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                            {t("orderDetailPage.label_document")}
                        </dt>
                        <dd className="text-sm text-graphite-700 mnx-num tabular-nums">
                            {user.idDocument}
                        </dd>
                    </dl>
                )}
            </div>
        </div>
    );
}

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
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>

            {/* Buyer */}
            <div>
                <Skeleton className="h-3 w-24 mb-3" />
                <div className="flex items-start gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            </div>

            {/* Products */}
            <div>
                <Skeleton className="h-3 w-24 mb-3" />
                <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
                    {[0, 1, 2].map((idx) => (
                        <div
                            key={idx}
                            className="hidden md:!grid grid-cols-12 items-center gap-4 px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0"
                        >
                            <div className="col-span-6 flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-md" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-2/3" />
                                    <Skeleton className="h-2.5 w-1/3" />
                                </div>
                            </div>
                            <Skeleton className="col-span-2 h-5 w-10 rounded-full" />
                            <Skeleton className="col-span-2 h-3 ml-auto w-20" />
                            <Skeleton className="col-span-2 h-3 ml-auto w-20" />
                        </div>
                    ))}
                    {[0, 1].map((idx) => (
                        <div key={`m-${idx}`} className="md:hidden px-4 py-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <Skeleton className="w-10 h-10 rounded-md" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-2/3" />
                                    <Skeleton className="h-2.5 w-1/2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <Skeleton className="h-4" />
                                <Skeleton className="h-4" />
                                <Skeleton className="h-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment */}
            <div>
                <Skeleton className="h-3 w-24 mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-2.5 w-24" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="space-y-2 md:text-right md:ml-auto md:w-40">
                        <Skeleton className="h-2.5 w-24 md:ml-auto" />
                        <Skeleton className="h-4 w-32 md:ml-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}
