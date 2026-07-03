import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  Clock,
  Eye,
  Send,
  X,
  XCircle,
} from "lucide-react";

import InvoiceListItemInfo from "../../DTO/Domain/InvoiceListItemInfo";
import {
  formatPrice,
  invoiceStatusPill,
  isValidDate,
} from "../InvoiceDetailPage/invoiceHelpers";

/**
 * BillingSearchRow — one invoice row for /admin/billing.
 * Two column layouts (manager 7 / seller 6) share the same JSX; the
 * `variant` prop toggles the vendedor cell + widths. Overdue/canceled
 * emphasis is duplicated on non-color signals for a11y.
 */

export type BillingSearchRowVariant = "manager" | "seller";

export interface BillingSearchRowLabels {
  buyerLabel: string;
  sellerLabel: string;
  dueDateLabel: string;
  amountLabel: string;
  viewDetails: string;
}

export interface BillingSearchRowProps {
  invoice: InvoiceListItemInfo;
  variant: BillingSearchRowVariant;
  labels: BillingSearchRowLabels;
  detailsHref: string;
  t: any;
}

function StatusIcon({ status }: { status: number }) {
  switch (status) {
    case 3: // Paid
      return <Check size={12} strokeWidth={2.5} aria-hidden="true" />;
    case 2: // Sent
      return <Send size={12} aria-hidden="true" />;
    case 1: // Pending
      return <Clock size={12} aria-hidden="true" />;
    case 4: // Overdue
      return <AlertTriangle size={12} aria-hidden="true" />;
    case 5: // Cancelled
      return <XCircle size={12} aria-hidden="true" />;
    case 6: // Expired
      return <X size={12} aria-hidden="true" />;
    default:
      return <Clock size={12} aria-hidden="true" />;
  }
}

// dd/MM/yyyy without time (short date column).
function formatDateOnly(iso?: string | null): string {
  if (!isValidDate(iso)) return "—";
  const d = new Date(iso as string);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function BillingSearchRow({
  invoice,
  variant,
  labels,
  detailsHref,
  t,
}: BillingSearchRowProps) {
  const pill = invoiceStatusPill(invoice.status, t);
  const isOverdue = invoice.status === 4;
  const isCancelled = invoice.status === 5;

  const invoiceNumber = invoice.invoiceNumber || `#${invoice.invoiceId}`;
  const buyerName = invoice.buyerName || "—";
  const buyerEmail = invoice.buyerEmail || "";
  const sellerName = invoice.sellerName || "—";
  const dueDateText = formatDateOnly(invoice.dueDate);

  // Column-span switch. Sums to 12 in either variant.
  const numCol = variant === "manager" ? "col-span-2" : "col-span-3";
  const buyerCol = variant === "manager" ? "col-span-3" : "col-span-4";

  const amountCls =
    "col-span-2 text-right text-sm font-semibold mnx-num tabular-nums " +
    (isCancelled ? "line-through text-graphite-400" : "text-graphite-900");

  const dueDateCls =
    "text-sm mnx-num tabular-nums " +
    (isOverdue ? "text-rose-700 font-semibold" : "text-graphite-700");

  const pillEl = (
    <span
      className={`inline-flex items-center gap-1 h-[24px] text-[11px] px-2 rounded-full font-semibold ring-1 ${pill.cls}`}
    >
      <StatusIcon status={invoice.status} />
      {pill.label}
    </span>
  );

  const actionEl = (
    <Link
      to={detailsHref}
      aria-label={labels.viewDetails}
      title={labels.viewDetails}
      className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      <Eye size={16} aria-hidden="true" />
    </Link>
  );

  return (
    <>
      {/* Desktop / tablet — grid row ------------------------------------ */}
      <div
        className="hidden md:!grid grid-cols-12 items-center gap-4 px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
        role="row"
      >
        {/* Invoice number */}
        <div className={`${numCol} min-w-0`} role="cell">
          <Link
            to={detailsHref}
            className="text-sm font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast font-mono"
          >
            {invoiceNumber}
          </Link>
        </div>

        {/* Buyer */}
        <div className={`${buyerCol} min-w-0`} role="cell">
          <div className="text-sm font-semibold text-graphite-900 truncate">
            {buyerName}
          </div>
          {buyerEmail && (
            <div className="text-[11px] text-graphite-500 truncate font-mono">
              {buyerEmail}
            </div>
          )}
        </div>

        {/* Seller (manager view only) */}
        {variant === "manager" && (
          <div className="col-span-2 min-w-0" role="cell">
            <div className="text-sm text-graphite-700 truncate">{sellerName}</div>
          </div>
        )}

        {/* Due date */}
        <div className="col-span-1 min-w-0" role="cell">
          <div className={dueDateCls}>{dueDateText}</div>
        </div>

        {/* Amount */}
        <div className={amountCls} role="cell">
          <span className="text-graphite-400 font-normal mr-1">R$</span>
          {formatPrice(invoice.total)}
        </div>

        {/* Status pill */}
        <div className="col-span-1 flex items-center justify-end" role="cell">
          {pillEl}
        </div>

        {/* Actions */}
        <div
          className="col-span-1 flex items-center justify-end gap-1"
          role="cell"
        >
          {actionEl}
        </div>
      </div>

      {/* Mobile — stacked card ----------------------------------------- */}
      <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4 hover:bg-orange-500/5 transition-colors duration-fast">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={detailsHref}
                className="text-base font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast font-mono"
              >
                {invoiceNumber}
              </Link>
              {pillEl}
            </div>
            <div className="mt-0.5 text-sm text-graphite-700 truncate">
              {buyerName}
            </div>
            {buyerEmail && (
              <div className="text-[11px] text-graphite-500 truncate font-mono">
                {buyerEmail}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">{actionEl}</div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-3">
          {variant === "manager" && (
            <div>
              <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                {labels.sellerLabel}
              </dt>
              <dd className="mt-0.5 text-sm text-graphite-700 truncate">
                {sellerName}
              </dd>
            </div>
          )}
          <div className={variant === "manager" ? "text-right" : ""}>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.dueDateLabel}
            </dt>
            <dd
              className={`mt-0.5 text-xs mnx-num tabular-nums ${
                isOverdue ? "text-rose-700 font-semibold" : "text-graphite-700"
              }`}
            >
              {dueDateText}
            </dd>
          </div>
          <div className={variant === "manager" ? "" : "text-right"}>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.amountLabel}
            </dt>
            <dd
              className={`mt-0.5 text-sm font-semibold mnx-num tabular-nums ${
                isCancelled ? "line-through text-graphite-400" : "text-graphite-900"
              }`}
            >
              <span className="text-graphite-400 font-normal mr-1">R$</span>
              {formatPrice(invoice.total)}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
