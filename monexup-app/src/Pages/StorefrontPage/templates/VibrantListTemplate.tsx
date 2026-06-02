/**
 * VibrantListTemplate — Variation B · "Vibrant Social" (listing)
 *
 * Vibe: GoFundMe · Patreon · Kickstarter. Bricolage Grotesque (variable
 * display sans) + Geist body. Off-white + ink + purple + coral + yellow.
 * Rounded 24px cards, soft purple glows, sticker badges. Hover lifts the
 * card 4px and glows purple. Pagination uses gradient pills.
 *
 * Self-contained: all tokens, fonts and reset rules scoped under
 * `.v-vibrant-list`. Never mutates global tokens.
 */
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StorefrontProductInfo, StorefrontTemplateProps, isDonation } from "../types";

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Geist:wght@300;400;500;600;700&display=swap";

const fmtBrlPlain = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value || 0);

const fmtBrlFull = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const initials = (s: string | undefined | null): string => {
    if (!s) return "?";
    const parts = s.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
};

/** See `EditorialListTemplate.buildPageItems` for the algorithm spec. */
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

export default function VibrantListTemplate({
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

    useEffect(() => {
        if (typeof document === "undefined") return;
        const existing = document.querySelector(`link[data-vendor-font="vibrant"]`);
        if (existing) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONT_HREF;
        link.setAttribute("data-vendor-font", "vibrant");
        document.head.appendChild(link);
    }, []);

    const isEmpty = !loading && products.length === 0;
    const pageItems = pageCount > 1 ? buildPageItems(pageCount, pageNum) : [];

    return (
        <div className="v-vibrant-list">
            <style dangerouslySetInnerHTML={{ __html: vibrantListCss }} />

            <header className="store-header">
                <div className="store-logo" aria-hidden="true">
                    {network?.imageUrl ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
                        <img src={network.imageUrl} alt="" />
                    ) : (
                        <span>{initials(network?.name)}</span>
                    )}
                </div>
                <div className="store-meta">
                    <h2 className="store-name display">{network?.name}</h2>
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
                        <h2 className="display">{t("vendor_storefront_list_title_b")}</h2>
                        {pageCount > 0 && (
                            <span className="count">
                                <span className="pulse" aria-hidden="true" />
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
                                  <SkeletonCard key={`sk-${idx}`} variant={(idx % 9) + 1} />
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
        : `${product.name} — ${fmtBrlFull(product.price)} · ${freqLabel}`;

    return (
        <Link className="pcard" to={href} aria-label={ariaLabel}>
            <div className="pcard__media">
                {product.imageUrl ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={product.imageUrl} alt="" loading="lazy" />
                ) : (
                    <div className={`mock v-mock-${mockIndex}`} aria-hidden="true" />
                )}
                {donation && (
                    <span className="pcard__badge donation">
                        {t("vendor_storefront_badge_cause")}
                    </span>
                )}
            </div>
            <div className="pcard__body">
                <h3 className="pcard__title display">{product.name}</h3>
                <div className="pcard__meta">
                    {donation ? (
                        <span className="pcard__donation-tag">
                            {t("vendor_storefront_product_donation_label")}
                        </span>
                    ) : (
                        <span className="pcard__price display">
                            <span className="currency">R$</span>
                            {fmtBrlPlain(product.price)}
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
                <div className={`mock v-mock-${variant}`} />
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
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 2v4" />
                    <path d="M12 18v4" />
                    <path d="M4.93 4.93l2.83 2.83" />
                    <path d="M16.24 16.24l2.83 2.83" />
                    <path d="M2 12h4" />
                    <path d="M18 12h4" />
                    <path d="M4.93 19.07l2.83-2.83" />
                    <path d="M16.24 7.76l2.83-2.83" />
                </svg>
            </div>
            <span className="sticker">{t("vendor_storefront_empty_badge")}</span>
            <h3 className="display">{t("vendor_storefront_empty_title_b")}</h3>
            <p>{t("vendor_storefront_empty_subtitle_b")}</p>
        </div>
    );
}

const vibrantListCss = `
.v-vibrant-list {
  --bg:        #FFF9F0;
  --bg-card:   #FFFFFF;
  --ink:       #15131F;
  --ink-soft:  #4A4658;
  --ink-mute:  #7E7991;
  --line:      #ECE6F2;
  --brand:     #6D28D9;
  --brand-2:   #FF7849;
  --accent:    #FFC93C;
  --mint:      #2DD4BF;
  --shadow:    0 8px 24px -10px rgba(109, 40, 217, 0.25);
  font-family: "Geist", "Inter", system-ui, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(ellipse 60% 40% at 90% 0%, rgba(255,120,73,.18), transparent 60%),
    radial-gradient(ellipse 50% 40% at 10% 100%, rgba(109,40,217,.16), transparent 60%),
    var(--bg);
  line-height: 1.55;
  min-height: 100vh;
}
.v-vibrant-list *, .v-vibrant-list *::before, .v-vibrant-list *::after { box-sizing: border-box; }
.v-vibrant-list *::selection { background: var(--brand); color: #fff; }
.v-vibrant-list .display { font-family: "Bricolage Grotesque", "Inter", sans-serif; }
.v-vibrant-list button { font-family: inherit; cursor: pointer; }
.v-vibrant-list a:focus-visible,
.v-vibrant-list button:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 4px;
}

.v-vibrant-list .store-header {
  padding: clamp(24px, 4vw, 48px) clamp(20px, 5vw, 56px) clamp(20px, 3vw, 32px);
  display: flex; flex-wrap: wrap; gap: 20px; align-items: center;
}
.v-vibrant-list .store-logo {
  width: 64px; height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
  color: #fff;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 28px;
  letter-spacing: -0.04em;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow);
  transform: rotate(-3deg);
  overflow: hidden;
  flex-shrink: 0;
}
.v-vibrant-list .store-logo img { width: 100%; height: 100%; object-fit: cover; }
.v-vibrant-list .store-meta { flex: 1; min-width: 200px; }
.v-vibrant-list .store-name {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 2.8vw, 30px);
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin: 0 0 4px;
  color: var(--ink);
}
.v-vibrant-list .store-tagline {
  color: var(--ink-soft);
  font-size: 14px;
  margin: 0;
}
.v-vibrant-list .vendor-chip {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 14px 6px 6px;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--line);
  box-shadow: 0 2px 8px -4px rgba(15,19,31,.08);
  font-size: 12px;
  color: var(--ink-soft);
}
.v-vibrant-list .vendor-chip .avatar {
  width: 28px; height: 28px; border-radius: 999px;
  background: linear-gradient(135deg, #FFC93C, #FF7849);
  color: #15131F; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px;
}
.v-vibrant-list .vendor-chip strong { color: var(--ink); font-weight: 600; }

.v-vibrant-list .list-head {
  padding: clamp(20px, 4vw, 40px) clamp(20px, 5vw, 56px) clamp(8px, 2vw, 16px);
  display: flex; flex-wrap: wrap; align-items: end; gap: 16px;
  justify-content: space-between;
}
.v-vibrant-list .list-head h2 {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.035em;
  line-height: 1.05;
  margin: 0;
  color: var(--ink);
}
.v-vibrant-list .list-head .count {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(109, 40, 217, 0.10);
  color: var(--brand);
  font-family: "Geist", sans-serif;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
}
.v-vibrant-list .list-head .count .pulse {
  width: 7px; height: 7px; border-radius: 999px; background: currentColor;
}

.v-vibrant-list .product-grid {
  padding: 0 clamp(20px, 5vw, 56px) clamp(32px, 5vw, 56px);
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(20px, 3vw, 32px);
}
@media (min-width: 640px) {
  .v-vibrant-list .product-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 980px) {
  .v-vibrant-list .product-grid { grid-template-columns: repeat(3, 1fr); }
}

.v-vibrant-list .pcard {
  display: flex; flex-direction: column;
  text-decoration: none;
  color: var(--ink);
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px -4px rgba(15,19,31,.08);
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  isolation: isolate;
}
.v-vibrant-list .pcard:hover,
.v-vibrant-list .pcard:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 24px 50px -18px rgba(109, 40, 217, 0.35);
  border-color: rgba(109, 40, 217, 0.35);
}
.v-vibrant-list .pcard__media {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 18px;
  margin: 12px 12px 0;
  background: var(--line);
}
.v-vibrant-list .pcard__media img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.v-vibrant-list .pcard__media .mock { position: absolute; inset: 0; }
.v-vibrant-list .v-mock-1 {
  background:
    radial-gradient(circle at 70% 30%, rgba(255,201,60,.7), transparent 55%),
    radial-gradient(circle at 30% 70%, rgba(45,212,191,.55), transparent 55%),
    linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
}
.v-vibrant-list .v-mock-2 { background: linear-gradient(135deg, #2DD4BF 0%, #6D28D9 100%); }
.v-vibrant-list .v-mock-3 {
  background:
    radial-gradient(circle at 30% 30%, rgba(255,201,60,.7), transparent 55%),
    linear-gradient(135deg, #FF7849 0%, #6D28D9 100%);
}
.v-vibrant-list .v-mock-4 { background: radial-gradient(circle at 60% 40%, #FFE9C4 0%, #FFC93C 50%, #FF7849 100%); }
.v-vibrant-list .v-mock-5 { background: linear-gradient(180deg, #6D28D9 0%, #15131F 100%); }
.v-vibrant-list .v-mock-6 {
  background: radial-gradient(circle at 50% 60%, #2DD4BF 0%, #6D28D9 70%, #15131F 100%);
}
.v-vibrant-list .v-mock-7 { background: linear-gradient(135deg, #FFC93C 0%, #FF7849 100%); }
.v-vibrant-list .v-mock-8 {
  background:
    radial-gradient(circle at 70% 30%, rgba(255,201,60,.6), transparent 55%),
    linear-gradient(135deg, #2DD4BF 0%, #FF7849 100%);
}
.v-vibrant-list .v-mock-9 {
  background: radial-gradient(circle at 50% 40%, #FFE9C4 0%, #FFC93C 30%, #FF7849 60%, #6D28D9 100%);
}

.v-vibrant-list .pcard__badge {
  position: absolute; top: 14px; left: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--ink);
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transform: rotate(-4deg);
  box-shadow: 0 6px 16px -4px rgba(0,0,0,.2);
}
.v-vibrant-list .pcard__badge.donation {
  background: var(--brand); color: #fff; transform: rotate(3deg);
}
.v-vibrant-list .pcard__body {
  padding: 16px 18px 20px;
  display: flex; flex-direction: column; gap: 10px;
}
.v-vibrant-list .pcard__title {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: clamp(17px, 1.5vw, 20px);
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin: 0;
  color: var(--ink);
}
.v-vibrant-list .pcard__meta {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-top: 2px;
}
.v-vibrant-list .pcard__price {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-feature-settings: "tnum" 1;
}
.v-vibrant-list .pcard__price .currency {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-mute);
  margin-right: 4px;
}
.v-vibrant-list .pcard__donation-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  color: #fff;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: -0.01em;
  box-shadow: 0 4px 12px -4px rgba(109,40,217,.4);
}
.v-vibrant-list .pcard__freq {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--ink); color: #fff;
  font-family: "Geist", sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.v-vibrant-list .pcard__freq .pill-dot { width: 5px; height: 5px; border-radius: 999px; background: var(--mint); }

.v-vibrant-list .pcard--skeleton { opacity: .65; pointer-events: none; }
.v-vibrant-list .sk {
  display: block; background: var(--line);
  border-radius: 999px; height: 14px; margin-top: 8px;
  position: relative; overflow: hidden;
}
.v-vibrant-list .sk-title { height: 18px; width: 80%; }
.v-vibrant-list .sk-meta { height: 14px; width: 55%; }
.v-vibrant-list .sk::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
  animation: vv-shimmer 1.4s linear infinite;
}
@keyframes vv-shimmer { from { transform: translateX(-100%);} to { transform: translateX(100%);} }

.v-vibrant-list .pagination {
  display: flex; justify-content: center; align-items: center; gap: 6px;
  padding: 0 clamp(20px, 5vw, 56px) clamp(36px, 5vw, 56px);
  flex-wrap: wrap;
}
.v-vibrant-list .pagination button {
  min-width: 44px;
  height: 44px;
  padding: 0 14px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink-soft);
  font-family: "Geist", sans-serif;
  font-weight: 600;
  font-size: 14px;
  font-feature-settings: "tnum" 1;
  transition: all .18s ease;
  box-shadow: 0 2px 6px -4px rgba(15,19,31,.1);
}
.v-vibrant-list .pagination button:hover:not(:disabled) {
  transform: translateY(-2px);
  color: var(--ink);
  border-color: rgba(109,40,217,.4);
  box-shadow: 0 8px 18px -8px rgba(109,40,217,.35);
}
.v-vibrant-list .pagination .current {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 8px 20px -8px rgba(109,40,217,.55);
}
.v-vibrant-list .pagination .current:hover { transform: translateY(-2px); }
.v-vibrant-list .pagination .arrow { gap: 8px; padding: 0 18px; }
.v-vibrant-list .pagination .arrow:disabled,
.v-vibrant-list .pagination .arrow[aria-disabled="true"] {
  color: var(--ink-mute);
  opacity: .5;
  cursor: not-allowed;
}
.v-vibrant-list .pagination .ellipsis {
  min-width: 28px;
  height: 44px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ink-mute);
  font-family: "Geist", sans-serif;
  font-size: 14px;
}

.v-vibrant-list .empty {
  padding: clamp(40px, 8vw, 96px) clamp(20px, 5vw, 56px) clamp(48px, 8vw, 96px);
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 18px;
}
.v-vibrant-list .empty .glyph {
  width: 112px; height: 112px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(109,40,217,.12), rgba(255,120,73,.18));
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--brand);
  box-shadow: 0 18px 40px -16px rgba(109,40,217,.45), inset 0 0 0 1px rgba(255,255,255,.6);
  transform: rotate(-4deg);
}
.v-vibrant-list .empty h3 {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: clamp(26px, 3.4vw, 36px);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
  max-width: 22ch;
  color: var(--ink);
}
.v-vibrant-list .empty p {
  color: var(--ink-soft);
  font-family: "Geist", "Inter", sans-serif;
  font-size: 15px;
  line-height: 1.6;
  max-width: 46ch;
  margin: 0;
}
.v-vibrant-list .empty .sticker {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--accent); color: var(--ink);
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transform: rotate(-3deg);
  box-shadow: 0 8px 18px -6px rgba(0,0,0,.2);
  margin-top: 4px;
}
`;
