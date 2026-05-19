/**
 * VibrantTemplate — Variation B · "Vibrant Social"
 *
 * Vibe: GoFundMe · Patreon · Kickstarter. Bricolage Grotesque (variable
 * display sans) + Geist for body. Off-white + ink + purple + coral + yellow.
 * Rounded 18–28px corners, soft purple glows, sticker-style floating badges,
 * gradient pill CTA with hover lift.
 *
 * Self-contained: all tokens and fonts scoped under `.v-vibrant`.
 */
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { VendorPaymentMethod, VendorTemplateProps } from "../types";
import { isDonation, isOpenDonation } from "../../StorefrontPage/types";

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Geist:wght@300;400;500;600;700&display=swap";

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

const SUGGEST_VALUES = [25, 50, 100, 250];

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
                strokeWidth={1.8}
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
                strokeWidth={1.8}
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
            strokeWidth={1.8}
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

export default function VibrantTemplate({
    view,
    paymentMethod,
    onPaymentMethodChange,
    amount,
    onAmountChange,
    submitting,
    onSubmit,
}: VendorTemplateProps) {
    const { t } = useTranslation();
    const { network, seller, product } = view;

    const donation = isDonation(product);
    const openDonation = isOpenDonation(product);
    const ctaLabel = donation ? t("vendor_product_donate_cta") : t("vendor_product_buy_cta");

    const sellerName = seller?.user?.name || "";
    const storeTagline = useMemo(
        () => (network?.email ? network.email : t("vendor_product_default_tagline")),
        [network, t]
    );

    const [amountInput, setAmountInput] = useState<string>(openDonation ? fmtAmountInput(amount) : "");
    useEffect(() => {
        if (openDonation) setAmountInput(fmtAmountInput(amount));
    }, [amount, openDonation]);

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

    // Pad thumbs to 4 with decorative tiles so the bottom row stays balanced.
    const thumbSlots: Array<{ src: string; index: number } | null> = (() => {
        const slots: Array<{ src: string; index: number } | null> = [];
        for (let i = 0; i < 4; i++) {
            slots.push(galleryImages[i] ? { src: galleryImages[i], index: i } : null);
        }
        return slots;
    })();

    return (
        <div className="v-vibrant">
            {/* Scoped stylesheet — dangerouslySetInnerHTML avoids the React
                warning emitted when <style> receives a string child and keeps
                whitespace intact so CSS parsing isn't affected. */}
            <style dangerouslySetInnerHTML={{ __html: vibrantCss }} />

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
                    <div className="vendor-chip" aria-label={t("vendor_product_sold_by", { name: sellerName }) as string}>
                        <span className="avatar" aria-hidden="true">{initials(sellerName)}</span>
                        <span>
                            {t("vendor_product_sold_by_prefix")} <strong>{sellerName}</strong>
                        </span>
                    </div>
                )}
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
                    <div className="thumbs" role="tablist" aria-label={t("vendor_product_gallery_label") as string}>
                        {thumbSlots.map((slot, i) => {
                            if (!slot) {
                                return (
                                    <div
                                        key={`ph-${i}`}
                                        className={`thumb thumb-placeholder t${(i % 4) + 1}`}
                                        aria-hidden="true"
                                    />
                                );
                            }
                            const active = heroIndex === slot.index;
                            return (
                                <button
                                    key={slot.src}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    className={`thumb${active ? " active" : ""}`}
                                    aria-label={t("vendor_product_gallery_thumb", { index: i + 1 }) as string}
                                    onClick={() => setHeroIndex(slot.index)}
                                    style={{ backgroundImage: `url(${slot.src})`, backgroundSize: "cover", backgroundPosition: "center" }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* INFO CARD */}
                <div className="info-card">
                    <span className="eyebrow">{network?.name}</span>
                    <h1 className="h1 display">{product.name}</h1>
                    {product.description && (
                        <div className="desc">
                            <p>{product.description}</p>
                        </div>
                    )}

                    {/* PRICE / OPEN AMOUNT */}
                    <div className="price-block">
                        {openDonation ? (
                            <div className="free-amount">
                                <label className="label" htmlFor="vendor-vibrant-amount">
                                    {t("vendor_product_donation_amount_label")}
                                </label>
                                <div className="input-wrap">
                                    <span className="currency-prefix" aria-hidden="true">R$</span>
                                    <input
                                        id="vendor-vibrant-amount"
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
                    <div className="payment" role="radiogroup" aria-labelledby="vendor-vibrant-pay-label">
                        <span className="label" id="vendor-vibrant-pay-label">
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
                                        <span className="nm">{t(`vendor_product_payment_${method}`)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="cta-row">
                        <button
                            className="cta"
                            type="button"
                            onClick={onSubmit}
                            disabled={submitting}
                        >
                            {donation && (
                                <span className="heart" aria-hidden="true">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M12 21s-7-4.35-9.5-8.5C.6 9.4 2.7 5 7 5c2.1 0 3.6 1 5 2.7C13.4 6 14.9 5 17 5c4.3 0 6.4 4.4 4.5 7.5C19 16.65 12 21 12 21Z" />
                                    </svg>
                                </span>
                            )}
                            {submitting ? t("loading") : ctaLabel}
                            <span aria-hidden="true">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.4}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </span>
                        </button>
                        <p className="cta-meta">
                            <span className="lock" aria-hidden="true">
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="4" y="11" width="16" height="10" rx="2" />
                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                                </svg>
                            </span>
                            {t("vendor_product_cta_meta_secure")}
                        </p>
                    </div>
                </div>
            </article>
        </div>
    );
}

const vibrantCss = `
.v-vibrant {
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
  --shadow-lg: 0 24px 60px -20px rgba(109, 40, 217, 0.35);

  font-family: "Geist", "Inter", system-ui, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(ellipse 60% 40% at 90% 0%, rgba(255,120,73,.18), transparent 60%),
    radial-gradient(ellipse 50% 40% at 10% 100%, rgba(109,40,217,.16), transparent 60%),
    var(--bg);
  line-height: 1.55;
  min-height: 100vh;
}
.v-vibrant *, .v-vibrant *::before, .v-vibrant *::after { box-sizing: border-box; }
.v-vibrant *::selection { background: var(--brand); color: #fff; }
.v-vibrant button { font-family: inherit; cursor: pointer; }
.v-vibrant button:focus-visible,
.v-vibrant input:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}
.v-vibrant .display { font-family: "Bricolage Grotesque", "Inter", sans-serif; }

.v-vibrant .store-header {
  padding: clamp(24px, 4vw, 48px) clamp(20px, 5vw, 56px) clamp(20px, 3vw, 32px);
  display: flex; flex-wrap: wrap; gap: 20px; align-items: center;
}
.v-vibrant .store-logo {
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
.v-vibrant .store-logo img { width: 100%; height: 100%; object-fit: cover; transform: rotate(3deg); }
.v-vibrant .store-meta { flex: 1; min-width: 200px; }
.v-vibrant .store-name {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 2.8vw, 30px);
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin: 0 0 4px;
  color: var(--ink);
}
.v-vibrant .store-tagline {
  color: var(--ink-soft);
  font-size: 14px;
  margin: 0;
}
.v-vibrant .vendor-chip {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 14px 6px 6px;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--line);
  box-shadow: 0 2px 8px -4px rgba(15,19,31,.08);
  font-size: 12px;
  color: var(--ink-soft);
}
.v-vibrant .vendor-chip .avatar {
  width: 28px; height: 28px; border-radius: 999px;
  background: linear-gradient(135deg, #FFC93C, #FF7849);
  color: #15131F; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px;
}
.v-vibrant .vendor-chip strong { color: var(--ink); font-weight: 600; }

.v-vibrant .product {
  padding: clamp(20px, 4vw, 40px) clamp(20px, 5vw, 56px) clamp(28px, 4vw, 56px);
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(24px, 4vw, 40px);
}
@media (min-width: 980px) {
  .v-vibrant .product { grid-template-columns: 1.1fr 1fr; align-items: start; }
}

.v-vibrant .gallery .g-hero {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 28px;
  overflow: hidden;
  background-color: var(--brand);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-image:
    radial-gradient(circle at 70% 20%, rgba(255,201,60,.55), transparent 50%),
    radial-gradient(circle at 30% 80%, rgba(45,212,191,.45), transparent 55%),
    linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
  box-shadow: var(--shadow-lg);
}
.v-vibrant .gallery .thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 12px;
}
.v-vibrant .gallery .thumb {
  aspect-ratio: 1;
  border-radius: 16px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform .2s ease, border-color .2s ease;
  padding: 0;
  background-color: var(--line);
}
.v-vibrant .gallery .thumb:hover { transform: translateY(-2px) scale(1.03); }
.v-vibrant .gallery .thumb.active { border-color: var(--ink); }
.v-vibrant .gallery .thumb-placeholder { cursor: default; pointer-events: none; }
.v-vibrant .gallery .thumb.t1 { background: linear-gradient(135deg, #FFC93C, #FF7849); }
.v-vibrant .gallery .thumb.t2 { background: linear-gradient(135deg, #2DD4BF, #6D28D9); }
.v-vibrant .gallery .thumb.t3 { background: linear-gradient(135deg, #FF7849, #6D28D9); }
.v-vibrant .gallery .thumb.t4 { background: linear-gradient(135deg, #FFE9C4, #FFC93C); }

.v-vibrant .info-card {
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 28px;
  padding: clamp(24px, 3vw, 36px);
  box-shadow: var(--shadow);
}
.v-vibrant .eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(109, 40, 217, 0.10);
  color: var(--brand);
  font-family: "Geist", sans-serif;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
  margin-bottom: 14px;
}
.v-vibrant .h1 {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: clamp(32px, 4.6vw, 48px);
  line-height: 1.04;
  letter-spacing: -0.035em;
  margin: 0 0 16px;
  color: var(--ink);
}
.v-vibrant .desc {
  font-family: "Geist", "Inter", sans-serif;
  font-size: 15px;
  line-height: 1.65;
  color: var(--ink-soft);
  margin: 0 0 24px;
}
.v-vibrant .desc p + p { margin-top: 12px; }
.v-vibrant .desc strong { color: var(--ink); font-weight: 700; }

.v-vibrant .price-block {
  background: linear-gradient(135deg, rgba(109,40,217,.04), rgba(255,120,73,.06));
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 20px;
  margin: 0 0 20px;
}
.v-vibrant .price-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.v-vibrant .price {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: clamp(36px, 4.4vw, 48px);
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--ink);
  font-feature-settings: "tnum" 1;
}
.v-vibrant .price-currency {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-mute);
}
.v-vibrant .frequency-pill {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 10px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--ink); color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.v-vibrant .frequency-pill .pill-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--mint); }

.v-vibrant .free-amount .label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-mute);
  margin-bottom: 10px;
  display: block;
}
.v-vibrant .free-amount .input-wrap {
  display: flex; align-items: center;
  background: #fff;
  border: 2px solid var(--ink);
  border-radius: 18px;
  padding: 8px 8px 8px 18px;
  min-height: 64px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.v-vibrant .free-amount .input-wrap:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(109,40,217,.15);
}
.v-vibrant .free-amount .currency-prefix {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 22px;
  color: var(--ink-mute);
  margin-right: 8px;
}
.v-vibrant .free-amount input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 32px;
  letter-spacing: -0.03em;
  color: var(--ink);
  width: 100%;
  min-width: 0;
  font-feature-settings: "tnum" 1;
}
.v-vibrant .free-amount .suggest {
  display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;
}
.v-vibrant .free-amount .suggest button {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--ink);
  padding: 9px 14px;
  border-radius: 999px;
  font-family: "Geist", sans-serif;
  font-size: 13px;
  font-weight: 600;
  transition: all .15s ease;
  min-height: 38px;
}
.v-vibrant .free-amount .suggest button:hover {
  background: var(--ink); color: #fff; border-color: var(--ink);
}

.v-vibrant .payment { margin-top: 24px; }
.v-vibrant .payment .label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-mute);
  margin-bottom: 10px;
  display: block;
}
.v-vibrant .payment-options {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 6px;
  background: var(--line);
  border-radius: 18px;
}
@media (max-width: 520px) {
  .v-vibrant .payment-options { grid-template-columns: 1fr; }
}
.v-vibrant .pay-option {
  position: relative;
  padding: 14px 12px;
  background: transparent;
  border: 0;
  border-radius: 14px;
  transition: background-color .18s ease, color .18s ease;
  min-height: 76px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
}
.v-vibrant .pay-option .ico {
  width: 26px; height: 26px;
  color: var(--ink-soft);
  transition: color .18s ease;
}
.v-vibrant .pay-option .nm {
  font-family: "Geist", sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-soft);
  transition: color .18s ease;
}
.v-vibrant .pay-option:hover { background: rgba(255,255,255,.6); }
.v-vibrant .pay-option[aria-checked="true"] {
  background: var(--ink);
}
.v-vibrant .pay-option[aria-checked="true"] .ico,
.v-vibrant .pay-option[aria-checked="true"] .nm {
  color: #fff;
}

.v-vibrant .cta-row { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
.v-vibrant .cta {
  width: 100%;
  min-height: 64px;
  padding: 18px 24px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
  color: #fff;
  border: 0;
  border-radius: 999px;
  font-family: "Bricolage Grotesque", sans-serif;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  box-shadow: 0 12px 32px -10px rgba(109, 40, 217, 0.6);
  transition: transform .15s ease, box-shadow .2s ease, filter .2s ease;
}
.v-vibrant .cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 40px -10px rgba(109, 40, 217, 0.7); filter: saturate(1.05); }
.v-vibrant .cta:active:not(:disabled) { transform: translateY(0); }
.v-vibrant .cta:disabled { opacity: .65; cursor: not-allowed; }
.v-vibrant .cta .heart { display: inline-block; }
.v-vibrant .cta-meta {
  font-size: 12px;
  color: var(--ink-mute);
  text-align: center;
  margin: 0;
  display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;
}
.v-vibrant .cta-meta .lock { display: inline-block; }
`;
