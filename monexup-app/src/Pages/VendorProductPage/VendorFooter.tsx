/**
 * VendorFooter — shared mini-footer rendered below every vendor template.
 *
 * Intentionally minimal: one orange MonexUp mark, "Powered by MonexUp" and
 * two legal links. Dark strip so it works under both Editorial (cream) and
 * Vibrant (off-white) variations.
 */
import { useTranslation } from "react-i18next";

export default function VendorFooter() {
    const { t } = useTranslation();
    return (
        <footer className="mnx-vendor-footer">
            <style dangerouslySetInnerHTML={{ __html: `
                .mnx-vendor-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px clamp(20px, 5vw, 56px);
                    background: #0A0A0D;
                    color: #C8C8CE;
                    font-family: "Inter", system-ui, -apple-system, sans-serif;
                    font-size: 12px;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .mnx-vendor-footer__brand {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    color: #FAFAF9;
                    text-decoration: none;
                }
                .mnx-vendor-footer__mark {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 22px;
                    border-radius: 6px;
                    background: #E85A1A;
                    color: #fff;
                    font-weight: 700;
                    font-size: 12px;
                    letter-spacing: -0.02em;
                }
                .mnx-vendor-footer__brand strong { font-weight: 600; color: #FAFAF9; }
                .mnx-vendor-footer__nav {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .mnx-vendor-footer__nav a {
                    color: #9A9AA3;
                    text-decoration: none;
                    transition: color .15s ease;
                }
                .mnx-vendor-footer__nav a:hover { color: #FAFAF9; }
                .mnx-vendor-footer__nav a:focus-visible {
                    outline: 2px solid #E85A1A;
                    outline-offset: 2px;
                }
                .mnx-vendor-footer__brand:focus-visible {
                    outline: 2px solid #E85A1A;
                    outline-offset: 2px;
                    border-radius: 4px;
                }
            ` }} />
            <a className="mnx-vendor-footer__brand" href="/" aria-label="MonexUp">
                <span className="mnx-vendor-footer__mark" aria-hidden="true">M</span>
                <span>
                    {t("vendor_product_powered_by_prefix")} <strong>MonexUp</strong>
                </span>
            </a>
            <nav className="mnx-vendor-footer__nav" aria-label={t("vendor_product_footer_legal") as string}>
                <a href="/privacy">{t("vendor_product_footer_privacy")}</a>
                <a href="/terms">{t("vendor_product_footer_terms")}</a>
            </nav>
        </footer>
    );
}
