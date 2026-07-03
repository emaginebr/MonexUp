/**
 * invoiceHelpers — shared formatting + status utilities for any page that
 * renders a MonexUp invoice row (OrderDetailPage's payment card and
 * InvoiceDetailPage). Kept here so both pages stay byte-identical on
 * status pill colors, total derivation and date formatting.
 */

// Minimal shape needed by the helpers so they don't couple to InvoiceInfo —
// the OrderDetailPage payment card feeds it a loose DTO from listInvoices,
// InvoiceDetailPage feeds it a full InvoiceInfo.
export interface InvoiceLike {
    invoiceId: number;
    invoiceNumber?: string | null;
    dueDate?: string | null;
    paidAt?: string | null;
    createdAt?: string | null;
    discount?: number | null;
    total?: number | null;
    status?: string | number | null;
    items?: Array<{ quantity?: number; unitPrice?: number; discount?: number }>;
}

// pt-BR fixed 2 decimals — currency symbol is rendered separately as a
// graphite-400 prefix so the numeric column stays tabular-nums aligned.
export function formatPrice(value: number | null | undefined): string {
    const n = typeof value === "number" && isFinite(value) ? value : 0;
    return n.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Format any ISO date as `dd/MM/yyyy HH:mm` regardless of locale so billing
// tables read predictably across pt/en/es/fr.
export function formatDateTimeShort(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (!isFinite(d.getTime())) return "—";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Guard against DateTime.MinValue / null / bogus dates. ProxyPay returns
// `0001-01-01` for fields the upstream API didn't populate — treat anything
// before 1990 as unset.
export function isValidDate(iso?: string | null): boolean {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    if (!isFinite(t)) return false;
    return t > new Date("1990-01-01").getTime();
}

// Status pill mapping — accepts both the numeric InvoiceStatusEnum values
// and the ProxyPay string aliases so this stays resilient to the DTO shape.
// 1=Pending, 2=Sent, 3=Paid, 4=Overdue, 5=Cancelled, 6=Expired.
export function invoiceStatusPill(
    status: string | number | null | undefined,
    t: any,
): { label: string; cls: string } {
    const s = String(status ?? "").toUpperCase();
    const n = typeof status === "number" ? status : Number(status);

    if (s === "PAID" || n === 3) {
        return {
            label: t("orderDetailPage.invoice_status_paid", "Pago"),
            cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
        };
    }
    if (s === "SENT" || n === 2) {
        return {
            label: t("orderDetailPage.invoice_status_sent", "Enviada"),
            cls: "bg-sky-500/10 text-sky-700 ring-sky-500/20",
        };
    }
    if (s === "PENDING" || s === "OPEN" || n === 1) {
        return {
            label: t("orderDetailPage.invoice_status_pending", "Pendente"),
            cls: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
        };
    }
    if (s === "OVERDUE" || n === 4) {
        return {
            label: t("orderDetailPage.invoice_status_overdue", "Vencida"),
            cls: "bg-orange-500/10 text-orange-700 ring-orange-500/20",
        };
    }
    if (s === "CANCELLED" || s === "CANCELED" || n === 5) {
        return {
            label: t("orderDetailPage.invoice_status_canceled", "Cancelada"),
            cls: "bg-graphite-100 text-graphite-700 ring-graphite-200",
        };
    }
    if (s === "EXPIRED" || n === 6) {
        return {
            label: t("orderDetailPage.invoice_status_expired", "Expirada"),
            cls: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
        };
    }
    return { label: s || "—", cls: "bg-graphite-100 text-graphite-700 ring-graphite-200" };
}

// Derive the invoice total when the backend omits it: gross = Σ max(0, qty × unitPrice − item.discount),
// then subtract the invoice-level discount, floored at 0.
export function invoiceTotal(inv: InvoiceLike): number {
    if (typeof inv.total === "number" && isFinite(inv.total) && inv.total > 0) {
        return inv.total;
    }
    const items = Array.isArray(inv.items) ? inv.items : [];
    const gross = items.reduce((acc, it) => {
        const q = typeof it.quantity === "number" ? it.quantity : 0;
        const p = typeof it.unitPrice === "number" ? it.unitPrice : 0;
        const d = typeof it.discount === "number" ? it.discount : 0;
        return acc + Math.max(0, q * p - d);
    }, 0);
    const invDisc = typeof inv.discount === "number" ? inv.discount : 0;
    return Math.max(0, gross - invDisc);
}
