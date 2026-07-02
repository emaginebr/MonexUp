import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap";

export default function CheckoutSuccessPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    // Vendor / storefront checkouts pass `returnUrl` via router state so the
    // CTA sends the buyer back to the exact seller storefront they came from.
    // Fallback: sessionStorage (survives hard reload); then /admin/dashboard.
    const stateReturn = (location.state as { returnUrl?: string } | null)?.returnUrl;
    const stored =
        typeof window !== "undefined"
            ? window.sessionStorage.getItem("mnx.checkoutReturnUrl") || ""
            : "";
    const returnUrl = stateReturn || stored || "/admin/dashboard";

    useEffect(() => {
        if (typeof document === "undefined") return;
        const existing = document.querySelector(`link[data-vendor-font="checkout-success"]`);
        if (existing) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONT_HREF;
        link.setAttribute("data-vendor-font", "checkout-success");
        document.head.appendChild(link);
    }, []);

    return (
        <div className="checkout-success">
            <style dangerouslySetInnerHTML={{ __html: checkoutSuccessCss }} />

            {/* Decorative gradient blobs — sit behind the card, aria-hidden */}
            <div className="cs-blobs" aria-hidden="true">
                <span className="cs-blob cs-blob-1" />
                <span className="cs-blob cs-blob-2" />
                <span className="cs-blob cs-blob-3" />
                <span className="cs-blob cs-blob-4" />
            </div>

            <main className="cs-stage">
                <section
                    className="cs-card"
                    role="status"
                    aria-live="polite"
                    aria-labelledby="checkout-success-title"
                >
                    <div className="cs-mark" aria-hidden="true">
                        <svg
                            viewBox="0 0 120 120"
                            width="88"
                            height="88"
                            role="presentation"
                            focusable="false"
                        >
                            <defs>
                                <linearGradient id="cs-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FF6A1A" />
                                    <stop offset="100%" stopColor="#F4B33B" />
                                </linearGradient>
                                <linearGradient id="cs-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FF6A1A" />
                                    <stop offset="100%" stopColor="#F4B33B" />
                                </linearGradient>
                            </defs>

                            {/* Soft outer halo */}
                            <circle cx="60" cy="60" r="56" className="cs-mark-halo" />

                            {/* Filled brand disk */}
                            <circle cx="60" cy="60" r="42" fill="url(#cs-fill-grad)" />

                            {/* Animated ring — stroke draws in */}
                            <circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke="url(#cs-ring-grad)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="cs-mark-ring"
                            />

                            {/* Checkmark — stroke draws in after ring */}
                            <path
                                d="M42 61.5 L54.5 74 L79 48.5"
                                fill="none"
                                stroke="#FFF8F2"
                                strokeWidth="7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="cs-mark-check"
                            />
                        </svg>
                    </div>

                    <p className="cs-eyebrow">
                        <span className="cs-eyebrow-dot" aria-hidden="true" />
                        {t("checkout_success_title")}
                    </p>

                    <h1 id="checkout-success-title" className="cs-title">
                        {t("checkout_success_title")}
                    </h1>

                    <p className="cs-message">{t("checkout_success_message")}</p>

                    <div className="cs-cta-wrap">
                        <button
                            type="button"
                            className="cs-cta"
                            onClick={() => {
                                if (typeof window !== "undefined") {
                                    window.sessionStorage.removeItem("mnx.checkoutReturnUrl");
                                }
                                navigate(returnUrl);
                            }}
                        >
                            <span>{t("back_to_dashboard")}</span>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.4}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

const checkoutSuccessCss = `
.checkout-success {
  --bg:        #FFF8F2;
  --bg-card:   #FFFFFF;
  --ink:       #1A1812;
  --ink-soft:  #5A574F;
  --ink-mute:  #8A8578;
  --line:      #EFE7DA;
  --brand:     #FF6A1A;
  --brand-2:   #F4B33B;
  --shadow-card: 0 10px 30px -16px rgba(26, 24, 18, 0.15);
  --shadow-cta:  0 20px 40px -14px rgba(255, 106, 26, 0.45);

  position: relative;
  min-height: 100vh;
  width: 100%;
  font-family: "Geist", "Inter", system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(ellipse 55% 40% at 88% 12%, rgba(244, 179, 59, 0.18), transparent 60%),
    radial-gradient(ellipse 50% 40% at 12% 88%, rgba(255, 106, 26, 0.14), transparent 60%),
    var(--bg);
  overflow: hidden;
  isolation: isolate;
}
.checkout-success *, .checkout-success *::before, .checkout-success *::after {
  box-sizing: border-box;
}
.checkout-success *::selection { background: var(--brand); color: #fff; }

/* Decorative blobs — 20% opacity behind the card */
.checkout-success .cs-blobs {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.checkout-success .cs-blob {
  position: absolute;
  display: block;
  border-radius: 999px;
  filter: blur(48px);
  opacity: 0.2;
}
.checkout-success .cs-blob-1 {
  width: 340px; height: 340px;
  top: -80px; left: -60px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
}
.checkout-success .cs-blob-2 {
  width: 260px; height: 260px;
  top: 20%; right: -60px;
  background: linear-gradient(135deg, var(--brand-2) 0%, var(--brand) 100%);
  opacity: 0.18;
}
.checkout-success .cs-blob-3 {
  width: 300px; height: 300px;
  bottom: -100px; right: 15%;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
  opacity: 0.16;
}
.checkout-success .cs-blob-4 {
  width: 220px; height: 220px;
  bottom: 10%; left: -40px;
  background: linear-gradient(135deg, var(--brand-2) 0%, var(--brand) 100%);
  opacity: 0.14;
}

.checkout-success .cs-stage {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 5vw, 64px) clamp(20px, 5vw, 56px);
}

.checkout-success .cs-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 28px;
  padding: clamp(32px, 5vw, 56px) clamp(24px, 5vw, 48px);
  box-shadow: var(--shadow-card);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* Checkmark ------------------------------------------------------------- */
.checkout-success .cs-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.checkout-success .cs-mark-halo {
  fill: rgba(255, 106, 26, 0.08);
}
.checkout-success .cs-mark-ring {
  stroke-dasharray: 327;
  stroke-dashoffset: 327;
  transform-origin: 60px 60px;
  transform: rotate(-90deg);
  animation: cs-ring-draw 900ms cubic-bezier(0.65, 0, 0.35, 1) 120ms forwards;
}
.checkout-success .cs-mark-check {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: cs-check-draw 420ms cubic-bezier(0.65, 0, 0.35, 1) 780ms forwards;
}
@keyframes cs-ring-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes cs-check-draw {
  to { stroke-dashoffset: 0; }
}

/* Eyebrow tag ----------------------------------------------------------- */
.checkout-success .cs-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 106, 26, 0.08);
  color: var(--brand);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.checkout-success .cs-eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 999px;
  background: var(--brand);
  box-shadow: 0 0 0 4px rgba(255, 106, 26, 0.15);
}

/* Display heading ------------------------------------------------------- */
.checkout-success .cs-title {
  font-family: "Geist", "Inter", sans-serif;
  font-weight: 700;
  font-size: clamp(32px, 5vw, 44px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin: 4px 0 0;
}

/* Supporting message ---------------------------------------------------- */
.checkout-success .cs-message {
  font-family: "Geist", "Inter", sans-serif;
  font-size: 16px;
  line-height: 1.55;
  color: var(--ink-soft);
  max-width: 40ch;
  margin: 0 auto;
}

/* CTA ------------------------------------------------------------------- */
.checkout-success .cs-cta-wrap {
  width: 100%;
  margin-top: 12px;
}
.checkout-success .cs-cta {
  width: 100%;
  min-height: 60px;
  padding: 18px 24px;
  background: var(--brand);
  color: #fff;
  border: 0;
  border-radius: 14px;
  font-family: "Geist", "Inter", sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: var(--shadow-cta);
  transition: transform 0.18s ease, box-shadow 0.22s ease, background-color 0.18s ease, filter 0.18s ease;
}
.checkout-success .cs-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 44px -14px rgba(255, 106, 26, 0.55);
  filter: saturate(1.05);
}
.checkout-success .cs-cta:active {
  transform: translateY(0);
}
.checkout-success .cs-cta:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .checkout-success .cs-mark-ring,
  .checkout-success .cs-mark-check {
    animation: none;
    stroke-dashoffset: 0;
  }
  .checkout-success .cs-cta,
  .checkout-success .cs-cta:hover,
  .checkout-success .cs-cta:active {
    transition: none;
    transform: none;
  }
}
`;
