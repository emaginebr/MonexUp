import { Link } from "react-router-dom";
import {
  Check,
  Clock,
  Eye,
  Hourglass,
  XCircle,
} from "lucide-react";

import InvoiceInfo from "../../DTO/Domain/InvoiceInfo";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import { InvoiceStatusEnum } from "../../DTO/Enum/InvoiceStatusEnum";

export interface InvoiceSearchRowLabels {
  /** dl labels (mobile) */
  buyerLabel: string;
  sellerLabel: string;
  productLabel: string;
  totalLabel: string;
  dueDateLabel: string;
  paidDateLabel: string;
  /** Action labels for aria-label/title */
  viewDetails: string;
  /** Translated status text for this invoice. */
  statusText: string;
}

export interface InvoiceSearchRowProps {
  invoice: InvoiceInfo;
  labels: InvoiceSearchRowLabels;
  /** Where the row's view-details button links to. */
  detailsHref: string;
  /** Number formatter for the total amount. */
  formatTotal: (value: number) => string;
  /** Date formatter for due/payment dates. */
  formatDate: (iso?: string) => string;
}

/**
 * InvoiceSearchRow — single `/admin/invoices` entry rendered in two layouts:
 *
 *   • md+ : 12-col grid row inside the card table.
 *           Invoice (#code + due/paid date subtitle) 3 / Counterparty
 *           (buyer name + seller subtitle) 3 / Product 2 /
 *           Amount (right) 2 / Status pill (right) 1 / Actions 1.
 *   • <md : stacked card. Invoice code + status pill on top,
 *           buyer + product subtitle, amount + due-date footer,
 *           action cluster on the right of the title row.
 *
 * Pure presentational. Parent owns formatters and the legacy
 * `showProducts` / `showTotal` / status mapping helpers.
 */

function statusPillClasses(status: InvoiceStatusEnum): string {
  switch (status) {
    case InvoiceStatusEnum.Paid:
      return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20";
    case InvoiceStatusEnum.Open:
      return "bg-orange-500/10 text-orange-700 ring-orange-500/20";
    case InvoiceStatusEnum.Cancelled:
    case InvoiceStatusEnum.Lost:
      return "bg-rose-500/10 text-rose-700 ring-rose-500/20";
    default:
      // Draft + any unknown
      return "bg-graphite-100 text-graphite-700 ring-graphite-200";
  }
}

function StatusIcon({ status }: { status: InvoiceStatusEnum }) {
  switch (status) {
    case InvoiceStatusEnum.Paid:
      return <Check size={12} aria-hidden="true" />;
    case InvoiceStatusEnum.Open:
      return <Clock size={12} aria-hidden="true" />;
    case InvoiceStatusEnum.Cancelled:
      return <XCircle size={12} aria-hidden="true" />;
    case InvoiceStatusEnum.Lost:
      return <XCircle size={12} aria-hidden="true" />;
    case InvoiceStatusEnum.Draft:
      return <Hourglass size={12} aria-hidden="true" />;
    default:
      return <Hourglass size={12} aria-hidden="true" />;
  }
}

function StatusPill({
  status,
  label,
  size = "md",
}: {
  status: InvoiceStatusEnum;
  label: string;
  size?: "sm" | "md";
}) {
  const cls = statusPillClasses(status);
  const heightCls = size === "sm" ? "h-[24px] text-[11px]" : "h-[26px] text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 ${heightCls} px-2 rounded-full font-semibold ring-1 ${cls}`}
    >
      <StatusIcon status={status} />
      {label}
    </span>
  );
}

// ----- legacy helpers (preserved 1:1) ---------------------------------------

function buildProductLine(order: OrderInfo | undefined): string {
  if (!order || !order.items || order.items.length === 0) return "";
  return order.items
    .filter((it) => !!it.product)
    .map((it) => `${it.product.name} (${it.quantity})`)
    .join(", ");
}

function computeTotal(order: OrderInfo | undefined): number {
  if (!order || !order.items) return 0;
  return order.items.reduce((acc, it) => {
    const price = it.product?.price ?? 0;
    return acc + price * it.quantity;
  }, 0);
}

// ----- component ------------------------------------------------------------

export default function InvoiceSearchRow({
  invoice,
  labels,
  detailsHref,
  formatTotal,
  formatDate,
}: InvoiceSearchRowProps) {
  const invoiceCode = `#${invoice.invoiceId}`;
  const buyerName = invoice.user?.name || "—";
  const sellerName = invoice.seller?.name;

  const productLine = buildProductLine(invoice.order);
  const totalAmount =
    invoice.price && invoice.price > 0
      ? invoice.price
      : computeTotal(invoice.order);

  // Subtitle date logic: prefer paid date for paid invoices,
  // otherwise fall back to due date — mirrors the legacy two-date columns
  // by giving readers the most relevant single-line cue per row.
  const isPaid = invoice.status === InvoiceStatusEnum.Paid;
  const subtitleDate = formatDate(
    isPaid ? invoice.paymentDate : invoice.dueDate
  );

  return (
    <>
      {/* Desktop / tablet — grid row ------------------------------------ */}
      <div
        className="hidden md:!grid grid-cols-12 items-center gap-4 px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
        role="row"
      >
        {/* Invoice cell */}
        <div className="col-span-3 min-w-0" role="cell">
          <Link
            to={detailsHref}
            className="text-sm font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast mnx-num tabular-nums"
          >
            {invoiceCode}
          </Link>
          <div className="text-xs text-graphite-500 truncate">
            {subtitleDate}
          </div>
        </div>

        {/* Counterparty cell */}
        <div className="col-span-3 min-w-0" role="cell">
          <div className="text-sm font-semibold text-graphite-900 truncate">
            {buyerName}
          </div>
          {sellerName && (
            <div className="text-xs text-graphite-500 truncate">
              {sellerName}
            </div>
          )}
        </div>

        {/* Product cell */}
        <div className="col-span-2 min-w-0" role="cell">
          <div className="text-sm text-graphite-700 truncate">
            {productLine || "—"}
          </div>
        </div>

        {/* Amount cell */}
        <div
          className="col-span-2 text-right text-sm text-graphite-900 font-semibold mnx-num tabular-nums"
          role="cell"
        >
          <span className="text-graphite-400 font-normal mr-1">R$</span>
          {formatTotal(totalAmount)}
        </div>

        {/* Status pill */}
        <div className="col-span-1 flex items-center justify-end" role="cell">
          <StatusPill
            status={invoice.status}
            label={labels.statusText}
            size="sm"
          />
        </div>

        {/* Actions */}
        <div
          className="col-span-1 flex items-center justify-end gap-1"
          role="cell"
        >
          <Link
            to={detailsHref}
            aria-label={labels.viewDetails}
            title={labels.viewDetails}
            className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <Eye size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Mobile — stacked card ----------------------------------------- */}
      <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4 hover:bg-orange-500/5 transition-colors duration-fast">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={detailsHref}
                className="text-base font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast mnx-num tabular-nums"
              >
                {invoiceCode}
              </Link>
              <StatusPill
                status={invoice.status}
                label={labels.statusText}
                size="sm"
              />
            </div>
            <div className="mt-0.5 text-sm text-graphite-700 truncate">
              {buyerName}
            </div>
            {productLine && (
              <div className="text-xs text-graphite-500 truncate">
                {productLine}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={detailsHref}
              aria-label={labels.viewDetails}
              title={labels.viewDetails}
              className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <Eye size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.totalLabel}
            </dt>
            <dd className="mt-0.5 text-sm text-graphite-900 font-semibold mnx-num tabular-nums">
              <span className="text-graphite-400 font-normal mr-1">R$</span>
              {formatTotal(totalAmount)}
            </dd>
          </div>
          <div className="text-right">
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {isPaid ? labels.paidDateLabel : labels.dueDateLabel}
            </dt>
            <dd className="mt-0.5 text-xs text-graphite-700 mnx-num tabular-nums">
              {subtitleDate}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
