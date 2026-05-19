/**
 * EditorialListTemplate — Variation A · "Editorial Premium" (listing)
 *
 * Vibe: Aesop · Stripe Atlas · long-form magazine. Fraunces (variable serif)
 * for display, Inter for body. Cream + warm-black + terracotta + brass.
 * Hairlines (1px), no surface shadows, 4:5 cards, hover reveals an inner
 * hairline and the title shifts to terracotta. Pagination uses Fraunces
 * numerals with a hairline underneath; active page is underlined terracotta.
 *
 * Self-contained: all tokens, fonts and reset rules are scoped under
 * `.v-editorial-list`. Never mutates global tokens.
 */
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StorefrontProductInfo, StorefrontTemplateProps, isDonation } from "../types";

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap";

const fmtBrl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const initials = (s: string | undefined | null): string => {
    if (!s) return "?";
    const parts = s.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
};

/**
 * Build a paginator slice with optional ellipsis markers.
 * `null` entries render as decorative "…" cells. Always shows first + last
 * page, current page +- 1, and clips the middle with ellipses when long.
 */
function buildPageItems(total: number, current: number): Array<number | null> {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const items: Array<number | null> = [];
    const push = (n: number | null) => {
        if (n === null) {
            if (items[items.length - 1] !== null) items.push(null);
            return;
        }
        if (!items.includes(n)) items.push(n);
    };
    push(1);
    if (current - 2 > 2) push(null);
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
        push(p);
    }
    if (current + 2 < total - 1) push(null);
    push(total);
    return items;
}

export default function EditorialListTemplate({
    view,
    networkSlug,
    sellerSlug,
    onPageChange,
}: StorefrontTemplateProps) {
    const { t } = useTranslation();
    const { network, seller, products, pageNum, pageCount, loading } = view;

    const sellerName = seller?.user?.name || "";
    const storeTagline = useMemo(
        () => (network?.email ? network.email : t("vendor_product_default_tagline")),
        [network, t],
    );

    // Lazy-load the variation's fonts once per session. Marker attribute is
    // shared with the detail page (`data-vendor-font="editorial"`) so the
    // <link> is deduped when the user navigates list → detail.
    useEffect(() => {
        if (typeof document === "undefined") return;
        const existing = document.querySelector(`link[data-vendor-font="editorial"]`);
        if (existing) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONT_HREF;
        link.setAttribute("data-vendor-font", "editorial");
        document.head.appendChild(link);
    }, []);

    const isEmpty = !loading && products.length === 0;
    const pageItems = pageCount > 1 ? buildPageItems(pageCount, pageNum) : [];

    return (
        <div className="v-editorial-list">
            <style dangerouslySetInnerHTML={{ __html: editorialListCss }} />

            <header className="store-header">
                <div className="store-logo" aria-hidden="true">
                    {network?.imageUrl ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
                        <img src={network.imageUrl} alt="" />
                    ) : (
                        <span>{initials(network?.name)}</span>
                    )}
                </div>
                <div>
                    <h2 className="store-name">{network?.name}</h2>
                    {storeTagline && <p className="store-tagline">{storeTagline}</p>}
                </div>
                {sellerName && (
                    <div
                        className="vendor-chip"
                        aria-label={t("vendor_product_sold_by", { name: sellerName }) as string}
                    >
                        <span className="avatar" aria-hidden="true">{initials(sellerName)}</span>
                        <span>
                            {t("vendor_product_sold_by_prefix")} <strong>{sellerName}</strong>
                        </span>
                    </div>
                )}
            </header>

            {isEmpty ? (
                <EmptyState />
            ) : (
                <>
                    <div className="list-head">
                        <div>
                            <span className="eyebrow">{t("vendor_storefront_list_eyebrow")}</span>
                            <h2 className="serif">
                                {t("vendor_storefront_list_title_a")}{" "}
                                <em>{t("vendor_storefront_list_title_a_em")}</em>
                            </h2>
                        </div>
                        {pageCount > 0 && (
                            <span className="count">
                                {t("vendor_storefront_count_meta", {
                                    page: pageNum,
                                    pages: Math.max(1, pageCount),
                                })}
                            </span>
                        )}
                    </div>

                    <div
                        className="product-grid"
                        aria-busy={loading || undefined}
                        aria-label={t("vendor_storefront_grid_label", { name: network?.name || "" }) as string}
                    >
                        {loading && products.length === 0
                            ? Array.from({ length: 6 }).map((_, idx) => (
                                  <SkeletonCard key={`sk-${idx}`} variant={(idx % 5) + 1} />
                              ))
                            : products.map((p, idx) => (
                                  <ProductCard
                                      key={p.productId}
                                      product={p}
                                      networkSlug={networkSlug}
                                      sellerSlug={sellerSlug}
                                      mockIndex={(idx % 9) + 1}
                                  />
                              ))}
                    </div>

                    {pageCount > 1 && (
                        <nav
                            className="pagination"
                            aria-label={t("vendor_storefront_pagination_label") as string}
                        >
                            <button
                                type="button"
                                className="arrow"
                                onClick={() => onPageChange(Math.max(1, pageNum - 1))}
                                disabled={pageNum <= 1}
                                aria-disabled={pageNum <= 1 || undefined}
                                aria-label={t("vendor_storefront_pagination_prev") as string}
                            >
                                <span aria-hidden="true">←</span> {t("vendor_storefront_pagination_prev")}
                            </button>
                            {pageItems.map((item, idx) =>
                                item === null ? (
                                    <span
                                        key={`el-${idx}`}
                                        className="ellipsis"
                                        aria-hidden="true"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={item}
                                        type="button"
                                        className={item === pageNum ? "current" : ""}
                                        aria-current={item === pageNum ? "page" : undefined}
                                        aria-label={
                                            t("vendor_storefront_pagination_page", { page: item }) as string
                                        }
                                        onClick={() => onPageChange(item)}
                                    >
                                        {item}
                                    </button>
                                ),
                            )}
                            <button
                                type="button"
                                className="arrow"
                                onClick={() => onPageChange(Math.min(pageCount, pageNum + 1))}
                                disabled={pageNum >= pageCount}
                                aria-disabled={pageNum >= pageCount || undefined}
                                aria-label={t("vendor_storefront_pagination_next") as string}
                            >
                                {t("vendor_storefront_pagination_next")} <span aria-hidden="true">→</span>
                            </button>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}

/* --------------------------------------------------------------------------
   Product card — link to the detail route. Bare image fallback uses a
   ceramic gradient mock from the approval HTML so empty Lofn products still
   look intentional.
   -------------------------------------------------------------------------- */
function ProductCard({
    product,
    networkSlug,
    sellerSlug,
    mockIndex,
}: {
    product: StorefrontProductInfo;
    networkSlug: string;
    sellerSlug: string;
    mockIndex: number;
}) {
    const { t } = useTranslation();
    const donation = isDonation(product);
    const href = `/${networkSlug}/store/${sellerSlug}/${product.slug}`;
    const freqLabel =
        product.frequency === 0
            ? t("frequency_unique")
            : product.frequency === 7
              ? t("frequency_week")
              : product.frequency === 30
                ? t("frequency_month")
                : product.frequency === 60
                  ? t("frequency_bimonthly")
                  : product.frequency === 90
                    ? t("frequency_quarter")
                    : product.frequency === 180
                      ? t("frequency_half")
                      : product.frequency === 365
                        ? t("frequency_year")
                        : t("frequency_unique");

    const ariaLabel = donation
        ? `${product.name} — ${t("vendor_storefront_product_donation_label")} · ${freqLabel}`
        : `${product.name} — ${fmtBrl(product.price)} · ${freqLabel}`;

    return (
        <Link className="pcard" to={href} aria-label={ariaLabel}>
            <div className="pcard__media">
                {product.imageUrl ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={product.imageUrl} alt="" loading="lazy" />
                ) : (
                    <div className={`mock mock-${mockIndex}`} aria-hidden="true" />
                )}
                {donation && (
                    <span className="pcard__badge donation">
                        {t("vendor_storefront_badge_cause")}
                    </span>
                )}
            </div>
            <div className="pcard__body">
                <h3 className="pcard__title serif">{product.name}</h3>
                <div className="pcard__meta">
                    {donation ? (
                        <span className="pcard__donation-tag">
                            <span className="pill-dot" aria-hidden="true" />
                            {t("vendor_storefront_product_donation_label")}
                        </span>
                    ) : (
                        <span className="pcard__price serif">
                            <span className="currency">R$</span>
                            {new Intl.NumberFormat("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }).format(product.price || 0)}
                        </span>
                    )}
                    <span className="pcard__freq">
                        <span className="pill-dot" aria-hidden="true" />
                        {freqLabel}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function SkeletonCard({ variant }: { variant: number }) {
    return (
        <div className="pcard pcard--skeleton" aria-hidden="true">
            <div className="pcard__media">
                <div className={`mock mock-${variant}`} />
            </div>
            <div className="pcard__body">
                <div className="sk sk-title" />
                <div className="sk sk-meta" />
            </div>
        </div>
    );
}

function EmptyState() {
    const { t } = useTranslation();
    return (
        <div className="empty">
            <div className="glyph" aria-hidden="true">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 7h18l-1.5 12a2 2 0 0 1-2 1.8H6.5A2 2 0 0 1 4.5 19L3 7Z" />
                    <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                </svg>
            </div>
            <span className="eyebrow" style={{ margin: 0 }}>
                {t("vendor_storefront_empty_eyebrow")}
            </span>
            <h3 className="serif">{t("vendor_storefront_empty_title")}</h3>
            <span className="rule" aria-hidden="true" />
            <p>{t("vendor_storefront_empty_subtitle")}</p>
        </div>
    );
}

/* ============================================================================
   Scoped CSS — every selector starts with `.v-editorial-list` so this
   stylesheet never bleeds into the rest of the app. Tokens stay local.
   Mirrors `docs/design/vendor-storefront-list.html` and reuses the EXACT
   palette from `VendorProductPage/templates/EditorialTemplate.tsx`.
   ============================================================================ */
const editorialListCss = `
.v-editorial-list {
  --bg:        #F4F1EA;
  --bg-alt:    #EBE7DD;
  --surface:   #FFFFFF;
  --ink:       #1A1812;
  --ink-soft:  #5A574F;
  --ink-mute:  #8E8A7E;
  --line:      #DBD6C9;
  --accent:    #8B3A2A;
  --accent-2:  #C9A36A;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background: var(--bg);
  line-height: 1.6;
  min-height: 100vh;
}
.v-editorial-list *, .v-editorial-list *::before, .v-editorial-list *::after { box-sizing: border-box; }
.v-editorial-list *::selection { background: var(--accent); color: #fff; }
.v-editorial-list .serif { font-family: "Fraunces", Georgia, serif; }
.v-editorial-list button { font-family: inherit; cursor: pointer; }
.v-editorial-list a:focus-visible,
.v-editorial-list button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 4px;
}

.v-editorial-list .store-header {
  padding: clamp(28px, 4vw, 56px) clamp(20px, 5vw, 64px) clamp(20px, 3vw, 36px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  border-bottom: 1px solid var(--line);
}
@media (min-width: 768px) {
  .v-editorial-list .store-header { grid-template-columns: auto 1fr auto; align-items: center; gap: 32px; }
}
.v-editorial-list .store-logo {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2A2520, #4A3F33);
  color: var(--accent-2);
  font-family: "Fraunces", Georgia, serif;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: -0.02em;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.v-editorial-list .store-logo img { width: 100%; height: 100%; object-fit: cover; }
.v-editorial-list .store-name {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  font-size: clamp(22px, 2.6vw, 30px);
  letter-spacing: -0.01em;
  margin: 0 0 4px;
  color: var(--ink);
}
.v-editorial-list .store-tagline {
  color: var(--ink-soft);
  font-size: 14px;
  margin: 0;
  max-width: 520px;
}
.v-editorial-list .vendor-chip {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: 12px;
  color: var(--ink-soft);
  align-self: start;
}
.v-editorial-list .vendor-chip .avatar {
  width: 28px; height: 28px; border-radius: 999px;
  background: linear-gradient(135deg, #C9A36A, #8B3A2A);
  color: #fff; font-weight: 600;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px;
}
.v-editorial-list .vendor-chip strong { color: var(--ink); font-weight: 600; }

.v-editorial-list .eyebrow {
  display: inline-flex; align-items: center; gap: 12px;
  font-family: "Inter", sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--accent);
  margin-bottom: 18px;
}
.v-editorial-list .eyebrow::before {
  content: ""; width: 40px; height: 1px; background: currentColor;
}

.v-editorial-list .list-head {
  padding: clamp(28px, 4vw, 48px) clamp(20px, 5vw, 64px) clamp(12px, 2vw, 20px);
  display: flex; flex-wrap: wrap; align-items: end; gap: 16px;
  justify-content: space-between;
}
.v-editorial-list .list-head h2 {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 500;
  font-size: clamp(28px, 3.6vw, 42px);
  line-height: 1.05;
  letter-spacing: -0.015em;
  margin: 0;
  color: var(--ink);
}
.v-editorial-list .list-head h2 em { font-style: italic; font-weight: 400; }
.v-editorial-list .list-head .count {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-mute);
}

.v-editorial-list .product-grid {
  padding: 0 clamp(20px, 5vw, 64px) clamp(36px, 5vw, 72px);
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(24px, 3vw, 40px) clamp(20px, 2.5vw, 32px);
}
@media (min-width: 640px) {
  .v-editorial-list .product-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 980px) {
  .v-editorial-list .product-grid { grid-template-columns: repeat(3, 1fr); }
}

.v-editorial-list .pcard {
  display: flex; flex-direction: column;
  text-decoration: none;
  color: var(--ink);
  background: transparent;
  transition: transform .25s ease;
  isolation: isolate;
}
.v-editorial-list .pcard__media {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--bg-alt);
  border: 1px solid var(--line);
}
.v-editorial-list .pcard__media::after {
  content: "";
  position: absolute; inset: 0;
  border: 1px solid transparent;
  transition: border-color .25s ease;
  pointer-events: none;
}
.v-editorial-list .pcard:hover .pcard__media::after,
.v-editorial-list .pcard:focus-visible .pcard__media::after { border-color: var(--ink); }
.v-editorial-list .pcard__media img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.v-editorial-list .pcard__media .mock { position: absolute; inset: 0; }
.v-editorial-list .mock-1 {
  background:
    radial-gradient(ellipse 30% 18% at 50% 92%, rgba(0,0,0,.35), transparent 70%),
    radial-gradient(circle at 50% 55%, #E8DDC8 0%, #B68C4E 60%, #4A3F33 100%);
}
.v-editorial-list .mock-2 {
  background:
    radial-gradient(ellipse 28% 16% at 50% 90%, rgba(0,0,0,.4), transparent 70%),
    linear-gradient(160deg, #DCD0B2 0%, #8B3A2A 65%, #2A1B16 100%);
}
.v-editorial-list .mock-3 {
  background:
    radial-gradient(circle at 40% 40%, #F4E9D2 0%, #C9A36A 50%, #6E4A2A 100%);
}
.v-editorial-list .mock-4 {
  background:
    radial-gradient(ellipse at 30% 70%, #B68C4E 0%, #4A3F33 50%, #1A1812 100%);
}
.v-editorial-list .mock-5 {
  background: linear-gradient(135deg, #EBE7DD 0%, #C9A36A 100%);
}
.v-editorial-list .mock-6 {
  background:
    radial-gradient(circle at 65% 35%, #FFF 0%, #DCD0B2 30%, #8B3A2A 100%);
}
.v-editorial-list .mock-7 {
  background:
    radial-gradient(ellipse at 50% 60%, #F4F1EA 0%, #B68C4E 60%, #2A1B16 100%);
}
.v-editorial-list .mock-8 {
  background: linear-gradient(180deg, #C9A36A 0%, #4A3F33 100%);
}
.v-editorial-list .mock-9 {
  background:
    radial-gradient(circle at 50% 45%, #E8DDC8 0%, #8B3A2A 70%, #1A1812 100%);
}
.v-editorial-list .pcard__badge {
  position: absolute; top: 14px; left: 14px;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(244, 241, 234, 0.94);
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.v-editorial-list .pcard__badge.donation { background: var(--ink); color: #fff; }
.v-editorial-list .pcard__body {
  padding: 18px 2px 0;
  display: flex; flex-direction: column; gap: 8px;
}
.v-editorial-list .pcard__title {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 500;
  font-size: clamp(18px, 1.4vw, 22px);
  line-height: 1.2;
  letter-spacing: -0.005em;
  margin: 0;
  color: var(--ink);
  transition: color .2s ease;
}
.v-editorial-list .pcard:hover .pcard__title,
.v-editorial-list .pcard:focus-visible .pcard__title { color: var(--accent); }
.v-editorial-list .pcard__meta {
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
  margin-top: 2px;
}
.v-editorial-list .pcard__price {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: -0.01em;
  color: var(--ink);
  font-feature-settings: "tnum" 1;
}
.v-editorial-list .pcard__price .currency {
  font-family: "Inter", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 4px;
}
.v-editorial-list .pcard__donation-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  border-radius: 0;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  font-family: "Inter", sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.v-editorial-list .pcard__donation-tag .pill-dot { width: 5px; height: 5px; border-radius: 999px; background: var(--accent); }
.v-editorial-list .pcard__freq {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-soft);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.v-editorial-list .pcard__freq .pill-dot { width: 5px; height: 5px; border-radius: 999px; background: var(--accent-2); }

/* Skeleton — same hairline frame, low-contrast bars instead of text. */
.v-editorial-list .pcard--skeleton { opacity: .65; pointer-events: none; }
.v-editorial-list .sk {
  display: block; background: var(--bg-alt);
  border-radius: 0; height: 14px; margin-top: 8px;
  position: relative; overflow: hidden;
}
.v-editorial-list .sk-title { height: 18px; width: 80%; }
.v-editorial-list .sk-meta { height: 14px; width: 55%; }
.v-editorial-list .sk::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
  animation: ve-shimmer 1.4s linear infinite;
}
@keyframes ve-shimmer { from { transform: translateX(-100%);} to { transform: translateX(100%);} }

.v-editorial-list .pagination {
  display: flex; justify-content: center; align-items: center; gap: 4px;
  padding: 0 clamp(20px, 5vw, 64px) clamp(36px, 5vw, 56px);
  flex-wrap: wrap;
}
.v-editorial-list .pagination button {
  min-width: 44px;
  height: 44px;
  padding: 0 14px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  color: var(--ink-soft);
  font-family: "Fraunces", Georgia, serif;
  font-weight: 500;
  font-size: 16px;
  font-feature-settings: "tnum" 1;
  transition: color .2s ease, border-color .2s ease;
}
.v-editorial-list .pagination button:hover:not(:disabled) {
  color: var(--ink); border-bottom-color: var(--ink);
}
.v-editorial-list .pagination .current {
  color: var(--accent);
  border-bottom: 1px solid var(--accent);
  font-weight: 600;
}
.v-editorial-list .pagination .arrow {
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
  gap: 8px;
}
.v-editorial-list .pagination .arrow:disabled,
.v-editorial-list .pagination .arrow[aria-disabled="true"] {
  color: var(--ink-mute);
  cursor: not-allowed;
}
.v-editorial-list .pagination .ellipsis {
  min-width: 28px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ink-mute);
  font-family: "Fraunces", Georgia, serif;
  font-size: 16px;
  height: 44px;
}

.v-editorial-list .empty {
  padding: clamp(40px, 8vw, 96px) clamp(20px, 5vw, 64px) clamp(48px, 8vw, 96px);
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 18px;
}
.v-editorial-list .empty .glyph {
  width: 96px; height: 96px;
  border: 1px solid var(--line);
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--accent);
  background: var(--surface);
}
.v-editorial-list .empty h3 {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 500;
  font-size: clamp(24px, 3vw, 34px);
  letter-spacing: -0.015em;
  line-height: 1.15;
  margin: 0;
  max-width: 28ch;
  color: var(--ink);
}
.v-editorial-list .empty p {
  color: var(--ink-soft);
  font-family: "Inter", sans-serif;
  font-size: 15px;
  line-height: 1.6;
  max-width: 48ch;
  margin: 0;
}
.v-editorial-list .empty .rule { width: 48px; height: 1px; background: var(--ink); margin: 4px 0; }
`;
