import { Link } from "react-router-dom";
import { Check, Circle, Pencil, X } from "lucide-react";
import { ProductStatusEnum } from "lofn-react";
import type { ProductInfo } from "lofn-react";

export interface ProductSearchRowLabels {
  /** Translated status text for this product. */
  statusText: string;
  /** Action labels (used as aria-label + title). */
  edit: string;
  /** Currency code prefix shown before the price. */
  currency: string;
  /** Default category label when the product has no resolved category. */
  defaultCategoryLabel: string;
  /** dl labels (mobile stacked card). */
  priceLabel: string;
  categoryLabel: string;
  statusLabel: string;
}

export interface ProductSearchRowProps {
  product: ProductInfo;
  labels: ProductSearchRowLabels;
  /** Optional category text resolved by the parent (Lofn category lookup). */
  categoryText?: string;
}

/**
 * ProductSearchRow — single row of `/admin/products` rendered in two layouts:
 *
 *   • md+   : a 12-column grid row (Product 5 / Category 2 / Price 2 / Status 1
 *             / Actions 2). Numeric cells use `mnx-num` and right-align.
 *   • <md   : a stacked card with thumbnail + name on top, status pill below,
 *             a `<dl>` strip with category + price, and the edit action on the
 *             title row.
 *
 * Pure presentational. Navigation to `/admin/products/:productId/edit` is
 * encoded directly because the page hands a single edit affordance.
 */

function formatPrice(value: number | null | undefined): string {
  const n = typeof value === "number" && isFinite(value) ? value : 0;
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getInitials(name: string | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function statusPillClasses(status: ProductStatusEnum): string {
  // emerald = active, rose = inactive, neutral = expired/draft.
  if (status === ProductStatusEnum.Active) {
    return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20";
  }
  if (status === ProductStatusEnum.Inactive) {
    return "bg-rose-500/10 text-rose-700 ring-rose-500/20";
  }
  return "bg-graphite-100 text-graphite-700 ring-graphite-200";
}

function StatusIcon({ status }: { status: ProductStatusEnum }) {
  if (status === ProductStatusEnum.Active) {
    return <Check size={11} aria-hidden="true" />;
  }
  if (status === ProductStatusEnum.Inactive) {
    return <X size={11} aria-hidden="true" />;
  }
  return <Circle size={11} aria-hidden="true" />;
}

export default function ProductSearchRow({
  product,
  labels,
  categoryText,
}: ProductSearchRowProps) {
  const editHref = `/admin/products/${product.productId}/edit`;
  const initials = getInitials(product.name);
  const statusClass = statusPillClasses(product.status);
  const category = categoryText || labels.defaultCategoryLabel;

  // Lofn ProductInfo carries a top-level `imageUrl` plus a richer `images[]`.
  const thumb = product.imageUrl || product.images?.[0]?.imageUrl || "";

  return (
    <>
      {/* Desktop / tablet — grid row ------------------------------------ */}
      <div
        className="hidden md:!grid grid-cols-12 items-center gap-4 px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
        role="row"
      >
        {/* Product cell */}
        <div className="col-span-5 min-w-0 flex items-center gap-3" role="cell">
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
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <Link
              to={editHref}
              className="block text-sm font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast truncate"
            >
              {product.name || "—"}
            </Link>
            {product.slug && (
              <div className="text-[11px] text-graphite-500 truncate font-mono">
                {product.slug}
              </div>
            )}
          </div>
        </div>

        {/* Category chip */}
        <div className="col-span-2 flex items-center justify-start" role="cell">
          <span className="inline-flex items-center h-[24px] px-2 rounded-full bg-graphite-100 text-graphite-700 ring-1 ring-graphite-200 text-[11px] font-semibold truncate max-w-full">
            {category}
          </span>
        </div>

        {/* Price */}
        <div
          className="col-span-2 text-right text-sm text-graphite-900 font-semibold mnx-num tabular-nums"
          role="cell"
        >
          <span className="text-graphite-400 font-normal mr-1">
            {labels.currency}
          </span>
          {formatPrice(product.price)}
        </div>

        {/* Status pill */}
        <div className="col-span-1 flex items-center justify-end" role="cell">
          <span
            className={`inline-flex items-center gap-1 h-[24px] px-2 rounded-full text-[11px] font-semibold ring-1 ${statusClass}`}
          >
            <StatusIcon status={product.status} />
            {labels.statusText}
          </span>
        </div>

        {/* Actions */}
        <div
          className="col-span-2 flex items-center justify-end gap-1"
          role="cell"
        >
          <Link
            to={editHref}
            aria-label={labels.edit}
            title={labels.edit}
            className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <Pencil size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Mobile — stacked card ----------------------------------------- */}
      <div className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4 hover:bg-orange-500/5 transition-colors duration-fast">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
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
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <Link
                to={editHref}
                className="block text-sm font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast truncate"
              >
                {product.name || "—"}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[11px] font-semibold ring-1 ${statusClass}`}
                >
                  <StatusIcon status={product.status} />
                  {labels.statusText}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={editHref}
              aria-label={labels.edit}
              className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <Pencil size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.categoryLabel}
            </dt>
            <dd className="mt-0.5 text-sm text-graphite-900 truncate">
              {category}
            </dd>
          </div>
          <div className="text-right">
            <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
              {labels.priceLabel}
            </dt>
            <dd className="mt-0.5 text-sm text-graphite-900 font-semibold mnx-num tabular-nums">
              <span className="text-graphite-400 font-normal mr-1">
                {labels.currency}
              </span>
              {formatPrice(product.price)}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
