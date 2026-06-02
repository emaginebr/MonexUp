/**
 * EditorialTemplate — Variation A · "Editorial Premium"
 *
 * Vibe: Aēsop · Stripe Atlas · long-form magazine. Fraunces (variable serif)
 * for display, Inter for body. Cream + warm-black + terracotta + brass.
 * Hairlines (1px), no surface shadows, asymmetric magazine grid, black
 * rectangular CTA that fills terracotta on hover.
 *
 * Self-contained: all tokens, fonts and reset rules are scoped under
 * `.v-editorial`. The component never mutates global tokens.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { VendorPaymentMethod, VendorTemplateProps } from "../types";
import { isDonation, isOpenDonation } from "../../StorefrontPage/types";

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap";

const fmtBrl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const fmtAmountInput = (n: number) =>
    new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const parseAmount = (raw: string): number => {
    const cleaned = raw.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
};

const initials = (s: string | undefined | null): string => {
    if (!s) return "?";
    const parts = s.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
};

const SUGGEST_VALUES = [50, 150, 320, 500];

const PAYMENT_OPTIONS: Array<{ method: VendorPaymentMethod; iconKey: "boleto" | "pix" | "card" }> = [
    { method: "boleto", iconKey: "boleto" },
    { method: "pix", iconKey: "pix" },
    { method: "card", iconKey: "card" },
];

function PaymentIcon({ kind }: { kind: "boleto" | "pix" | "card" }) {
    if (kind === "pix") {
        return (
            <svg
                className="ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M12 3 3 12l9 9 9-9-9-9Z" />
                <path d="m7.5 7.5 4.5 4.5" />
                <path d="m16.5 7.5-4.5 4.5" />
                <path d="m12 12 4.5 4.5" />
                <path d="m12 12-4.5 4.5" />
            </svg>
        );
    }
    if (kind === "card") {
        return (
            <svg
                className="ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 15h4" />
            </svg>
        );
    }
    return (
        <svg
            className="ico"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="6" width="18" height="14" rx="2" />
            <path d="M3 10h18" />
            <path d="M7 16h4" />
        </svg>
    );
}

export default function EditorialTemplate({
    view,
    paymentMethod,
    onPaymentMethodChange,
    amount,
    onAmountChange,
    submitting,
    onSubmit,
    buyer,
    onBuyerChange,
    isLoggedIn,
    onOpenLogin,
    onLogout,
}: VendorTemplateProps) {
    const { t } = useTranslation();
    const { network, seller, product } = view;
    const params = useParams<{ networkSlug: string; sellerSlug: string }>();
    const storeUrl = `/${params.networkSlug ?? ""}/store/${params.sellerSlug ?? ""}`;

    const donation = isDonation(product);
    const openDonation = isOpenDonation(product);
    const ctaLabel = donation ? t("vendor_product_donate_cta") : t("vendor_product_buy_cta");

    const sellerName = seller?.user?.name || "";
    const storeTagline = useMemo(
        () => (network?.email ? network.email : t("vendor_product_default_tagline")),
        [network, t]
    );

    // Local input string state for the open-donation field so user can type
    // freely (e.g. "150,5") without forcing a numeric round-trip per keystroke.
    const [amountInput, setAmountInput] = useState<string>(openDonation ? fmtAmountInput(amount) : "");
    useEffect(() => {
        if (openDonation) setAmountInput(fmtAmountInput(amount));
    }, [amount, openDonation]);

    // Lazy-load fonts (scoped to this template surface). Font sheet is shared
    // across mounts via a stable href so it loads once per session.
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

    // Gallery: hero is product.imageUrl; thumbs come from product.images (Lofn
    // model) when available. Selecting a thumb swaps the hero source.
    const galleryImages = useMemo(() => {
        const list: string[] = [];
        if (product.imageUrl) list.push(product.imageUrl);
        for (const img of product.images ?? []) {
            if (img.imageUrl && !list.includes(img.imageUrl)) list.push(img.imageUrl);
        }
        return list;
    }, [product]);

    const [heroIndex, setHeroIndex] = useState<number>(0);
    const heroImage = galleryImages[heroIndex] ?? null;

    return (
        <div className="v-editorial">
            {/* Scoped stylesheet — dangerouslySetInnerHTML avoids the React
                warning emitted when <style> receives a string child and keeps
                whitespace intact so CSS parsing isn't affected. */}
            <style dangerouslySetInnerHTML={{ __html: editorialCss }} />

            <header className="store-header">
                <Link to={storeUrl} className="store-logo" aria-hidden="true">
                    {network?.imageUrl ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
                        <img src={network.imageUrl} alt="" />
                    ) : (
                        <span>{initials(network?.name)}</span>
                    )}
                </Link>
                <div>
                    <Link to={storeUrl} className="store-name" aria-label={t("back_button") as string}>
                        {network?.name}
                    </Link>
                    {storeTagline && <p className="store-tagline">{storeTagline}</p>}
                </div>
                {sellerName && (
                    <div className="vendor-chip" aria-label={t("vendor_product_sold_by", { name: sellerName }) as string}>
                        <span className="avatar" aria-hidden="true">{initials(sellerName)}</span>
                        <span>
                            {t("vendor_product_sold_by_prefix")}{" "}
                            <strong>{sellerName}</strong>
                        </span>
                    </div>
                )}
                <Link to={storeUrl} className="back-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m12 19-7-7 7-7" />
                        <path d="M19 12H5" />
                    </svg>
                    <span>{t("back_button")}</span>
                </Link>
            </header>

            <article className="product">
                {/* GALLERY */}
                <div className="gallery" aria-label={t("vendor_product_gallery_label") as string}>
                    <div
                        className="g-hero"
                        role="img"
                        aria-label={product.name}
                        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
                    />
                    {galleryImages.slice(1, 4).map((src, idx) => (
                        <button
                            key={src}
                            type="button"
                            className="g-thumb"
                            aria-label={t("vendor_product_gallery_thumb", { index: idx + 2 }) as string}
                            onClick={() => setHeroIndex(idx + 1)}
                            style={{ backgroundImage: `url(${src})` }}
                        />
                    ))}
                    {/* Placeholder thumbs to keep the magazine grid balanced when
                        the product ships fewer than 4 images. They are inert
                        decorative tiles, not buttons, so they don't appear in
                        the tab order. */}
                    {Array.from({ length: Math.max(0, 3 - Math.max(0, galleryImages.length - 1)) }).map((_, idx) => (
                        <div key={`ph-${idx}`} className={`g-thumb g-placeholder g${(idx % 3) + 1}`} aria-hidden="true" />
                    ))}
                </div>

                {/* INFO */}
                <div>
                    <span className="eyebrow">{network?.name}</span>
                    <h1 className="h1">{product.name}</h1>
                    {product.description && (
                        <div className="desc">
                            <p>{product.description}</p>
                        </div>
                    )}

                    {/* PRICE / OPEN AMOUNT */}
                    <div className="price-block">
                        {openDonation ? (
                            <div className="free-amount">
                                <label className="label" htmlFor="vendor-editorial-amount">
                                    {t("vendor_product_donation_amount_label")}
                                </label>
                                <div className="input-wrap">
                                    <span className="currency-prefix" aria-hidden="true">R$</span>
                                    <input
                                        id="vendor-editorial-amount"
                                        type="text"
                                        inputMode="decimal"
                                        value={amountInput}
                                        placeholder={t("vendor_product_donation_amount_placeholder") as string}
                                        aria-label={t("vendor_product_donation_amount_label") as string}
                                        onChange={(e) => {
                                            setAmountInput(e.target.value);
                                            onAmountChange?.(parseAmount(e.target.value));
                                        }}
                                    />
                                </div>
                                <div className="suggest" aria-label={t("vendor_product_donation_suggestions") as string}>
                                    {SUGGEST_VALUES.map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => {
                                                setAmountInput(fmtAmountInput(v));
                                                onAmountChange?.(v);
                                            }}
                                        >
                                            R$ {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="price-row">
                                    <span className="price">{fmtBrl(product.price)}</span>
                                    <span className="price-currency">BRL</span>
                                </div>
                                <span
                                    className="frequency-pill"
                                    aria-label={t("vendor_product_frequency_oneshot") as string}
                                >
                                    <span className="pill-dot" aria-hidden="true" />
                                    {t("vendor_product_frequency_oneshot")}
                                </span>
                            </>
                        )}
                    </div>

                    {/* PAYMENT */}
                    <div className="payment" role="radiogroup" aria-labelledby="vendor-editorial-pay-label">
                        <span className="label" id="vendor-editorial-pay-label">
                            {t("vendor_product_payment_label")}
                        </span>
                        <div className="payment-options">
                            {PAYMENT_OPTIONS.map(({ method, iconKey }) => {
                                const checked = paymentMethod === method;
                                return (
                                    <button
                                        key={method}
                                        type="button"
                                        role="radio"
                                        aria-checked={checked}
                                        className="pay-option"
                                        onClick={() => onPaymentMethodChange(method)}
                                    >
                                        <PaymentIcon kind={iconKey} />
                                        <span>
                                            <span className="nm">{t(`vendor_product_payment_${method}`)}</span>
                                            <span className="meta">{t(`vendor_product_payment_${method}_meta`)}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* INLINE BUYER FORM */}
                    <div className="buyer-form" role="group" aria-label={t("simple_login_title") as string}>
                        <div className="bf-row">
                            <label className="bf-field">
                                <span className="bf-label">{t("field_name")}</span>
                                <input
                                    type="text"
                                    value={buyer.name}
                                    onChange={(e) => onBuyerChange({ name: e.target.value })}
                                    disabled={isLoggedIn || submitting}
                                />
                            </label>
                            <label className="bf-field">
                                <span className="bf-label">{t("field_email")}</span>
                                <input
                                    type="email"
                                    value={buyer.email}
                                    onChange={(e) => onBuyerChange({ email: e.target.value })}
                                    disabled={isLoggedIn || submitting}
                                />
                            </label>
                        </div>
                        <div className="bf-row">
                            <label className="bf-field">
                                <span className="bf-label">{t("field_phone") || "Telefone"}</span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={buyer.phone}
                                    onChange={(e) => onBuyerChange({ phone: e.target.value.replace(/\D/g, "") })}
                                    disabled={submitting}
                                />
                            </label>
                            <label className="bf-field">
                                <span className="bf-label">{t("field_cpf")}</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={14}
                                    value={buyer.cpf}
                                    onChange={(e) => onBuyerChange({ cpf: e.target.value.replace(/\D/g, "") })}
                                    disabled={submitting}
                                />
                            </label>
                        </div>
                        {!isLoggedIn && (
                            <p className="bf-login-hint">
                                {t("simple_login_have_account") || "Já tem uma conta?"}{" "}
                                <button type="button" className="bf-login-link" onClick={onOpenLogin}>
                                    {t("sign_in") || "Entrar"}
                                </button>
                            </p>
                        )}
                        {isLoggedIn && (
                            <p className="bf-logout-hint">
                                <button type="button" className="bf-login-link" onClick={onLogout}>
                                    {t("logout_my_account") || "Sair da minha conta"}
                                </button>
                            </p>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="cta-row">
                        <button
                            className="cta"
                            type="button"
                            onClick={onSubmit}
                            disabled={submitting}
                        >
                            {submitting ? t("loading") : ctaLabel}
                            <span className="arrow" aria-hidden="true">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </span>
                        </button>
                        <p className="cta-meta">{t("vendor_product_cta_meta_secure")}</p>
                    </div>
                </div>
            </article>
        </div>
    );
}

/* ============================================================================
   Scoped CSS — every selector starts with `.v-editorial` so this stylesheet
   never bleeds into the rest of the app. Tokens stay local to the variation.
   ============================================================================ */
const editorialCss = `
.v-editorial {
  --bg:        #F4F1EA;
  --bg-alt:    #EBE7DD;
  --surface:   #FFFFFF;
  --ink:       #1A1812;
  --ink-soft:  #5A574F;
  --ink-mute:  #8E8A7E;
  --line:      #DBD6C9;
  --accent:    #8B3A2A;
  --accent-2:  #C9A36A;
  --rule:      #1A1812;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background: var(--bg);
  line-height: 1.6;
  min-height: 100vh;
}
.v-editorial *, .v-editorial *::before, .v-editorial *::after { box-sizing: border-box; }
.v-editorial *::selection { background: var(--accent); color: #fff; }
.v-editorial button { font-family: inherit; cursor: pointer; }
.v-editorial button:focus-visible,
.v-editorial input:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}

.v-editorial .store-header {
  padding: clamp(28px, 4vw, 56px) clamp(20px, 5vw, 64px) clamp(20px, 3vw, 36px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  border-bottom: 1px solid var(--line);
}
@media (min-width: 768px) {
  .v-editorial .store-header { grid-template-columns: auto 1fr auto; align-items: center; gap: 32px; }
}
.v-editorial .store-logo {
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
.v-editorial .store-logo img { width: 100%; height: 100%; object-fit: cover; }
.v-editorial a.store-logo { text-decoration: none; cursor: pointer; }
.v-editorial a.store-name,
.v-editorial .store-name {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  font-size: clamp(22px, 2.6vw, 30px);
  letter-spacing: -0.01em;
  margin: 0 0 4px;
  color: var(--ink);
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
}
.v-editorial a.store-name:hover { color: var(--accent-2); }
.v-editorial .back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.v-editorial .back-btn:hover {
  background: var(--ink);
  color: var(--cream);
}
.v-editorial .store-tagline {
  color: var(--ink-soft);
  font-size: 14px;
  margin: 0;
  max-width: 520px;
}
.v-editorial .vendor-chip {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: 12px;
  color: var(--ink-soft);
  align-self: start;
}
.v-editorial .vendor-chip .avatar {
  width: 28px; height: 28px; border-radius: 999px;
  background: linear-gradient(135deg, #C9A36A, #8B3A2A);
  color: #fff; font-weight: 600;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px;
}
.v-editorial .vendor-chip strong { color: var(--ink); font-weight: 600; }

.v-editorial .eyebrow {
  display: inline-flex; align-items: center; gap: 12px;
  font-family: "Inter", sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--accent);
  margin-bottom: 18px;
}
.v-editorial .eyebrow::before {
  content: ""; width: 40px; height: 1px; background: currentColor;
}

.v-editorial .product {
  padding: clamp(28px, 5vw, 72px) clamp(20px, 5vw, 64px);
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(28px, 4vw, 56px);
}
@media (min-width: 980px) {
  .v-editorial .product { grid-template-columns: 1.15fr 1fr; align-items: start; }
}

.v-editorial .gallery {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 80px;
  gap: 12px;
}
.v-editorial .gallery > * { border-radius: 4px; overflow: hidden; }
.v-editorial .gallery .g-hero {
  grid-column: span 6;
  grid-row: span 6;
  background-color: #2A1B16;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-image: radial-gradient(circle at 30% 30%, #C9A36A 0%, #8B3A2A 38%, #2A1B16 100%);
  position: relative;
}
.v-editorial .gallery .g-thumb {
  grid-column: span 2;
  grid-row: span 3;
  background-size: cover; background-position: center;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: transform .25s ease, box-shadow .25s ease;
  padding: 0;
  background-color: var(--bg-alt);
}
.v-editorial .gallery .g-thumb:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -12px rgba(0,0,0,.25); }
.v-editorial .gallery .g-placeholder { cursor: default; pointer-events: none; }
.v-editorial .gallery .g-placeholder.g1 { background: linear-gradient(135deg, #E8DDC8 0%, #B68C4E 100%); }
.v-editorial .gallery .g-placeholder.g2 { background: linear-gradient(135deg, #4A3F33 0%, #8B3A2A 100%); }
.v-editorial .gallery .g-placeholder.g3 { background: linear-gradient(135deg, #DCD0B2 0%, #2A1B16 100%); }

.v-editorial .h1 {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 500;
  font-size: clamp(36px, 5vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.015em;
  margin: 0 0 18px;
  color: var(--ink);
}
.v-editorial .desc {
  font-family: "Inter", sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: var(--ink-soft);
  max-width: 56ch;
  margin: 0 0 28px;
}
.v-editorial .desc p + p { margin-top: 14px; }
.v-editorial .desc strong { color: var(--ink); font-weight: 600; }

.v-editorial .price-block { border-top: 1px solid var(--line); padding-top: 24px; margin-bottom: 24px; }
.v-editorial .price-row { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.v-editorial .price {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  font-size: clamp(38px, 4.4vw, 52px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink);
  font-feature-settings: "tnum" 1;
}
.v-editorial .price-currency {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.v-editorial .frequency-pill {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid var(--rule);
  color: var(--ink);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.v-editorial .frequency-pill .pill-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent); }

.v-editorial .free-amount { padding-top: 8px; }
.v-editorial .free-amount .label {
  font-family: "Inter", sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-mute);
  display: block;
  margin-bottom: 10px;
}
.v-editorial .free-amount .input-wrap {
  display: flex; align-items: center;
  background: var(--surface);
  border: 1px solid var(--rule);
  padding: 4px 4px 4px 18px;
  min-height: 56px;
}
.v-editorial .free-amount .currency-prefix {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 500;
  font-size: 22px;
  color: var(--ink-mute);
  margin-right: 8px;
}
.v-editorial .free-amount input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  font-size: 32px;
  color: var(--ink);
  width: 100%;
  min-width: 0;
  font-feature-settings: "tnum" 1;
}
.v-editorial .free-amount .suggest {
  display: flex; gap: 6px; margin-top: 14px; flex-wrap: wrap;
}
.v-editorial .free-amount .suggest button {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink);
  padding: 8px 14px;
  border-radius: 0;
  font-size: 13px;
  font-weight: 500;
  transition: all .18s ease;
  min-height: 36px;
}
.v-editorial .free-amount .suggest button:hover {
  background: var(--ink); color: #fff; border-color: var(--ink);
}

.v-editorial .payment { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--line); }
.v-editorial .payment .label {
  font-family: "Inter", sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--ink-mute);
  display: block;
  margin-bottom: 14px;
}
.v-editorial .payment-options {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
}
@media (max-width: 520px) {
  .v-editorial .payment-options { grid-template-columns: 1fr; }
}
.v-editorial .pay-option {
  position: relative;
  padding: 16px 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  transition: border-color .15s ease, background-color .15s ease;
  min-height: 88px;
  display: flex; flex-direction: column; justify-content: space-between;
  text-align: left;
  border-radius: 0;
}
.v-editorial .pay-option:hover { border-color: var(--ink); }
.v-editorial .pay-option[aria-checked="true"] {
  border-color: var(--ink);
  background: var(--bg-alt);
}
.v-editorial .pay-option[aria-checked="true"]::after {
  content: ""; position: absolute; top: 10px; right: 10px;
  width: 16px; height: 16px; border-radius: 999px;
  background: var(--accent);
  box-shadow: inset 0 0 0 3px var(--bg-alt);
}
.v-editorial .pay-option .ico { width: 28px; height: 28px; color: var(--ink); }
.v-editorial .pay-option .nm {
  font-family: "Inter", sans-serif;
  font-size: 13px; font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink);
  display: block;
}
.v-editorial .pay-option .meta {
  font-size: 11px;
  color: var(--ink-mute);
  margin-top: 2px;
  display: block;
}

.v-editorial .buyer-form { margin-top: 28px; display: flex; flex-direction: column; gap: 14px; }
.v-editorial .buyer-form .bf-row { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 600px) { .v-editorial .buyer-form .bf-row { grid-template-columns: 1fr 1fr; } }
.v-editorial .buyer-form .bf-field { display: flex; flex-direction: column; gap: 6px; }
.v-editorial .buyer-form .bf-label {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.v-editorial .buyer-form input {
  height: 44px;
  padding: 0 12px;
  border-radius: 0;
  border: 1px solid var(--ink);
  background: transparent;
  font-family: "Inter", system-ui, sans-serif;
  font-size: 14px;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s ease;
}
.v-editorial .buyer-form input:focus {
  border-color: var(--accent-2);
}
.v-editorial .buyer-form input:disabled {
  background: rgba(0,0,0,0.04);
  color: var(--ink-soft);
  cursor: not-allowed;
}
.v-editorial .bf-login-hint {
  margin: 0;
  font-family: "Inter", system-ui, sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  text-align: center;
}
.v-editorial .bf-logout-hint {
  margin: 0;
  font-family: "Inter", system-ui, sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  text-align: right;
}
.v-editorial .bf-login-link {
  background: none;
  border: 0;
  padding: 0;
  color: var(--accent-2);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
.v-editorial .bf-login-link:hover { color: var(--ink); }
.v-editorial .cta-row { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; }
.v-editorial .cta {
  width: 100%;
  min-height: 60px;
  padding: 18px 24px;
  background: var(--ink);
  color: #fff;
  border: 1px solid var(--ink);
  border-radius: 0;
  font-family: "Inter", sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  transition: background-color .2s ease, transform .15s ease;
}
.v-editorial .cta:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); }
.v-editorial .cta:active:not(:disabled) { transform: translateY(1px); }
.v-editorial .cta:disabled { opacity: .55; cursor: not-allowed; }
.v-editorial .cta .arrow { display: inline-block; transition: transform .2s ease; }
.v-editorial .cta:hover:not(:disabled) .arrow { transform: translateX(4px); }
.v-editorial .cta-meta {
  font-size: 12px;
  color: var(--ink-mute);
  text-align: center;
  margin: 0;
}
.v-editorial .cta-meta strong { color: var(--ink); font-weight: 600; }
`;
