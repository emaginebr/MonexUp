import { Link } from "react-router-dom";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import AuthContext from "../../Contexts/Auth/AuthContext";

/**
 * Footer — dark mesh footer for the home redesign.
 * Surfaces: brand column, Produto, Empresa, Legal, Contato + bottom bar.
 */
export default function Footer() {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);

  const isAuthenticated = Boolean(authContext.sessionInfo);

  const socialLinks = [
    { icon: Facebook, href: "#", label: t("footer_social_facebook") },
    { icon: Twitter, href: "#", label: t("footer_social_twitter") },
    { icon: Instagram, href: "#", label: t("footer_social_instagram") },
    { icon: Linkedin, href: "#", label: t("footer_social_linkedin") },
  ];

  return (
    <footer
      role="contentinfo"
      className="mnx-surface-dark bg-mesh-footer text-mnx-neutral-50 pt-20 pb-10"
    >
      <div className="max-w-container mx-auto px-shell">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand ------------------------------------------------------- */}
          <div className="lg:col-span-5">
            <Link
              to="/"
              className="mnx-mark mb-5"
              aria-label="MonexUp — Home"
            >
              <span className="mnx-mark__square" aria-hidden="true">
                M<span className="text-graphite-900">.</span>
              </span>
              <span className="mnx-mark__word text-mnx-neutral-50">
                monex
                <span className="bg-orange-500 text-white px-1.5 rounded-sm ml-0.5">
                  up
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-graphite-300 leading-relaxed max-w-md">
              {t("footer_description")}{" "}
              <span className="text-orange-400 font-semibold">
                {t("footer_tagline")}
              </span>
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-white/10 hover:border-orange-500 hover:text-orange-400 transition-colors duration-fast"
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Produto ----------------------------------------------------- */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 mb-4">
              {t("footer_column_product")}
            </h4>
            <ul className="space-y-3 text-sm text-graphite-200">
              <li>
                <a
                  href="#features"
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("home_features_title")}
                </a>
              </li>
              <li>
                <a
                  href="#networks"
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("home_networkpart_title")}
                </a>
              </li>
              <li>
                <a
                  href="#plans"
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("footer_plans")}
                </a>
              </li>
              <li>
                <Link
                  to={
                    isAuthenticated
                      ? "/admin/dashboard"
                      : "/account/login?returnUrl=%2Fadmin%2Fdashboard"
                  }
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("footer_dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa ----------------------------------------------------- */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 mb-4">
              {t("footer_column_company")}
            </h4>
            <ul className="space-y-3 text-sm text-graphite-200">
              <li>
                <Link
                  to="/network"
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("create_your_network")}
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthenticated ? "/request-access" : "/new-seller"}
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("be_a_representative")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal ------------------------------------------------------- */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 mb-4">
              {t("footer_column_legal")}
            </h4>
            <ul className="space-y-3 text-sm text-graphite-200">
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("footer_legal_terms")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("footer_legal_privacy")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contato ----------------------------------------------------- */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 mb-4">
              {t("footer_column_contact")}
            </h4>
            <ul className="space-y-3 text-sm text-graphite-200">
              <li>
                <a
                  href="mailto:contato@monexup.com"
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  contato@monexup.com
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-fast"
                >
                  {t("footer_contact_support")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-graphite-400">
          <p>
            {t("footer_copyright_current_year", {
              year: new Date().getFullYear(),
            })}{" "}
            {t("footer_all_rights_reserved")}
          </p>
          <p className="font-display tracking-wider uppercase">
            {t("footer_tagline_loud")}
          </p>
        </div>
      </div>
    </footer>
  );
}
