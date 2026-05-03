import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

/**
 * MiniFooter — slim, single-row footer for post-login pages.
 *
 * Visual contract: see `docs/design/dashboard-redesign.html` (footer band)
 * and `docs/design/dashboard-spec.md` section 7. This is intentionally
 * separate from the marketing `<Footer />` (which carries a 4-column
 * sitemap). The signed-in dashboard does not need a sitemap — the navbar
 * already exposes navigation — so we render a discreet brand presence,
 * copyright, and a small social row.
 */
export default function MiniFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: t("footer_social_facebook") },
    { icon: Twitter, href: "#", label: t("footer_social_twitter") },
    { icon: Instagram, href: "#", label: t("footer_social_instagram") },
    { icon: Linkedin, href: "#", label: t("footer_social_linkedin") },
  ];

  return (
    <footer
      role="contentinfo"
      className="mnx-surface-dark bg-mesh-footer text-graphite-300 border-t border-white/5"
    >
      <div className="max-w-container mx-auto px-shell py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Left: small wordmark */}
          <Link
            to="/"
            className="mnx-mark mnx-mark--sm"
            aria-label="MonexUp — Home"
          >
            <img
              src="/logo.png"
              alt="MonexUp"
              className="h-7 w-auto"
            />
          </Link>

          {/* Center: copyright */}
          <p className="text-center sm:text-left">
            &copy; {year} MonexUp &middot; {t("footer_all_rights_reserved")}
          </p>

          {/* Right: socials */}
          <ul
            className="flex items-center gap-2"
            aria-label={t("minifooter_social_aria")}
          >
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="inline-flex w-8 h-8 items-center justify-center rounded-md text-graphite-300 hover:text-orange-400 hover:bg-white/5 transition-colors duration-fast"
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
