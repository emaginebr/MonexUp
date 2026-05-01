import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import AuthContext from "../../Contexts/Auth/AuthContext";

/**
 * Header — sticky dark navbar for the marketing home.
 *
 * Split note: the previous CRA `Header.tsx` mixed the navbar AND the hero
 * copy. The redesign separates concerns — this file is now ONLY the
 * navbar; the hero copy lives in `Hero.tsx`.
 */

interface NavItem {
  labelKey: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "home", href: "#home" },
  { labelKey: "home_networkpart_title", href: "#networks" },
  { labelKey: "footer_plans", href: "#plans" },
  { labelKey: "home_features_title", href: "#features" },
];

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const closeMobile = () => setMobileOpen(false);
  const isAuthenticated = Boolean(authContext.sessionInfo);

  return (
    <header
      className="mnx-surface-dark sticky top-0 z-50 border-b border-white/5 backdrop-blur-md"
      style={{ background: "rgba(10, 10, 13, 0.85)" }}
    >
      <nav
        className="max-w-container mx-auto px-shell flex items-center justify-between h-16 lg:h-20"
        aria-label="Primary"
      >
        <Link to="/" className="mnx-mark" aria-label="MonexUp — Home">
          <img
            src="/logo.png"
            alt="MonexUp"
            className="h-10 lg:h-12 w-auto"
          />
        </Link>

        <ul className="hidden lg:flex items-center gap-8 text-sm font-medium text-graphite-200">
          {NAV_ITEMS.map((item) => (
            <li key={item.labelKey}>
              <a
                href={item.href}
                className="hover:text-white transition-colors duration-fast"
              >
                {t(item.labelKey)}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/network"
              className="hover:text-white transition-colors duration-fast"
            >
              {t("create_your_network")}
            </Link>
          </li>
          {!isAuthenticated && (
            <li>
              <Link
                to="/account/login"
                className="hover:text-white transition-colors duration-fast"
              >
                {t("sign_in")}
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/network")}
            className="inline-flex h-10 items-center px-4 rounded-md text-sm font-medium text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
          >
            {t("create_your_network")}
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex h-10 items-center px-4 rounded-md text-sm font-medium text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
            >
              {t("footer_dashboard")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/account/login")}
              className="inline-flex h-10 items-center px-4 rounded-md text-sm font-medium text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
            >
              {t("sign_in")}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? "/request-access" : "/new-seller")}
            className="cta-primary inline-flex h-10 items-center px-5 rounded-md text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-fast shadow-glow-md"
          >
            {t("be_a_representative")}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="lg:hidden inline-flex w-10 h-10 items-center justify-center rounded-md text-graphite-100 hover:bg-white/5"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls="mnx-mobile-nav"
          >
            {mobileOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="mnx-mobile-nav"
          className="lg:hidden border-t border-white/5"
          style={{ background: "rgba(10, 10, 13, 0.95)" }}
        >
          <ul className="max-w-container mx-auto px-shell py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.labelKey}>
                <a
                  href={item.href}
                  onClick={closeMobile}
                  className="flex items-center min-h-[44px] px-3 rounded-md text-base text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                >
                  {t(item.labelKey)}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  navigate(isAuthenticated ? "/admin/dashboard" : "/account/login");
                }}
                className="flex items-center w-full min-h-[44px] px-3 rounded-md text-base text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
              >
                {isAuthenticated ? t("footer_dashboard") : t("sign_in")}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
