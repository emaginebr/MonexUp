import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronDown,
  UserCircle,
  LayoutDashboard,
  Pencil,
  Lock,
  LogOut,
} from "lucide-react";
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import InvoiceContext from "../../Contexts/Invoice/InvoiceContext";
import { getLangInfo } from "../../i18n";
import { LanguageEnum } from "../../DTO/Enum/LanguageEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import {
  Users,
  Briefcase,
  Settings,
  Network as NetworkIcon,
  FileText,
  DollarSign,
  Package,
  Search,
  ShieldCheck,
} from "lucide-react";
import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";

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

const SUPPORTED_LANGS = [
  LanguageEnum.Portuguese,
  LanguageEnum.English,
  LanguageEnum.Spanish,
  LanguageEnum.French,
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);
  const invoiceContext = useContext(InvoiceContext);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [langOpen, setLangOpen] = useState<boolean>(false);
  const [myNetworkOpen, setMyNetworkOpen] = useState<boolean>(false);
  const [networkSelOpen, setNetworkSelOpen] = useState<boolean>(false);
  const [roleOpen, setRoleOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);
  const myNetworkRef = useRef<HTMLDivElement | null>(null);
  const networkSelRef = useRef<HTMLDivElement | null>(null);
  const roleRef = useRef<HTMLDivElement | null>(null);
  const currentLang = getLangInfo(i18n.language);
  const flagBase = (import.meta as any).env?.BASE_URL ?? "/";

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);
  const isAuthenticated = Boolean(authContext.sessionInfo);
  const userName = authContext.sessionInfo?.name ?? "";

  useEffect(() => {
    if (!userMenuOpen) return;
    const onDocClick = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const onDocClick = (event: MouseEvent) => {
      if (
        langRef.current &&
        !langRef.current.contains(event.target as Node)
      ) {
        setLangOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [langOpen]);

  useEffect(() => {
    const cfg: Array<[boolean, React.RefObject<HTMLDivElement>, (v: boolean) => void]> = [
      [myNetworkOpen, myNetworkRef, setMyNetworkOpen],
      [networkSelOpen, networkSelRef, setNetworkSelOpen],
      [roleOpen, roleRef, setRoleOpen],
    ];
    const open = cfg.find(([o]) => o);
    if (!open) return;
    const [, ref, setter] = open;
    const onDocClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setter(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setter(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [myNetworkOpen, networkSelOpen, roleOpen]);

  const handleLogout = () => {
    closeUserMenu();
    const ret = authContext.logout();
    if (ret.sucesso) {
      navigate("/");
    }
  };

  const handleNavigate = (path: string) => {
    closeUserMenu();
    closeMobile();
    navigate(path);
  };

  return (
    <header
      className="mnx-surface-dark sticky top-0 z-50 border-b border-white/5 backdrop-blur-md"
      style={{ background: "rgba(10, 10, 13, 0.85)" }}
    >
      <nav
        className="max-w-container mx-auto px-shell flex items-center justify-between h-16 lg:h-20"
        aria-label="Primary"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="mnx-mark shrink-0" aria-label="MonexUp — Home">
            <img
              src="/logo.png"
              alt="MonexUp"
              className="h-10 lg:h-12 w-auto"
            />
          </Link>

          {isAuthenticated && networkContext?.userNetworks?.length > 0 && (
            <div className="relative" ref={networkSelRef}>
              <button
                type="button"
                onClick={() => setNetworkSelOpen((o) => !o)}
                className="inline-flex h-10 items-center gap-2 px-3 rounded-md text-sm font-medium text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast max-w-[14rem]"
                aria-haspopup="menu"
                aria-expanded={networkSelOpen}
              >
                <Briefcase size={16} className="text-orange-400 shrink-0" />
                <span className="truncate">
                  {networkContext.userNetwork?.network?.name ?? t("no_network_selected")}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-fast ${networkSelOpen ? "rotate-180" : ""}`}
                />
              </button>
              {networkSelOpen && (
                <div
                  role="menu"
                  className="absolute left-0 mt-2 w-72 rounded-lg border border-white/10 shadow-xl overflow-hidden z-50"
                  style={{ background: "rgba(15, 15, 19, 0.98)" }}
                >
                  <p className="px-4 py-3 text-xs uppercase tracking-wider text-graphite-400 border-b border-white/5">
                    {t("select_network_to_connect")}
                  </p>
                  <ul className="py-1 max-h-64 overflow-y-auto">
                    {networkContext.userNetworks.map((un) => (
                      <li key={un.networkId}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            networkContext.setUserNetwork(un);
                            setNetworkSelOpen(false);
                            navigate("/admin/dashboard");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                        >
                          <Users size={16} className="text-graphite-300" />
                          <span className="truncate">{un.network?.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-white/5 py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setNetworkSelOpen(false); navigate("/network/search"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-300 hover:text-orange-200 hover:bg-orange-500/10 transition-colors duration-fast"
                    >
                      <Search size={16} />
                      {t("search_for_a_network")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => navigate("/network")}
                className="inline-flex h-10 items-center px-4 rounded-md text-sm font-medium text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
              >
                {t("create_your_network")}
              </button>

              <button
                type="button"
                onClick={() => navigate("/new-seller")}
                className="cta-primary inline-flex h-10 items-center px-5 rounded-md text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-fast shadow-glow-md"
              >
                {t("be_a_representative")}
              </button>
            </>
          )}


          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 px-3 rounded-md text-sm font-medium text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
              aria-haspopup="menu"
              aria-expanded={langOpen}
              aria-controls="mnx-lang-menu"
              aria-label={t(currentLang.nameKey)}
            >
              <img
                src={`${flagBase}flags/${currentLang.flag}`}
                alt={t(currentLang.nameKey)}
                className="w-5 h-5 rounded-sm"
              />
              <ChevronDown
                size={14}
                className={`transition-transform duration-fast ${
                  langOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {langOpen && (
              <div
                id="mnx-lang-menu"
                role="menu"
                className="absolute right-0 mt-2 w-44 rounded-lg border border-white/10 shadow-xl overflow-hidden"
                style={{ background: "rgba(15, 15, 19, 0.98)" }}
              >
                <ul className="py-1">
                  {SUPPORTED_LANGS.map((code) => {
                    const info = getLangInfo(code);
                    return (
                      <li key={info.code}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => changeLanguage(info.code)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                        >
                          <img
                            src={`${flagBase}flags/${info.flag}`}
                            alt={t(info.nameKey)}
                            className="w-5 h-5 rounded-sm"
                          />
                          {t(info.nameKey)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="inline-flex h-10 items-center gap-2 px-3 rounded-md text-sm font-medium text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-controls="mnx-user-menu"
              >
                <UserCircle size={18} className="text-orange-400" />
                <span className="max-w-[10rem] truncate">{userName}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-fast ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div
                  id="mnx-user-menu"
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-lg border border-white/10 shadow-xl overflow-hidden"
                  style={{ background: "rgba(15, 15, 19, 0.98)" }}
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs uppercase tracking-wider text-graphite-400">
                      {t("logged_in_as") || t("user")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white truncate">
                      {userName}
                    </p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNavigate("/admin/dashboard")}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                      >
                        <LayoutDashboard size={16} className="text-graphite-300" />
                        {t("footer_dashboard")}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNavigate("/admin/edit-account")}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                      >
                        <Pencil size={16} className="text-graphite-300" />
                        {t("edit_account")}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNavigate("/account/change-password")}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                      >
                        <Lock size={16} className="text-graphite-300" />
                        {t("change_password")}
                      </button>
                    </li>
                  </ul>
                  <div className="border-t border-white/5 py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-300 hover:text-orange-200 hover:bg-orange-500/10 transition-colors duration-fast"
                    >
                      <LogOut size={16} />
                      {t("logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/account/login")}
              className="inline-flex h-10 items-center px-4 rounded-md text-sm font-medium text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
            >
              {t("sign_in")}
            </button>
          )}

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
            {isAuthenticated ? (
              <>
                <li className="border-t border-white/5 mt-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate("/admin/dashboard")}
                    className="flex items-center gap-3 w-full min-h-[44px] px-3 rounded-md text-base text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                  >
                    <LayoutDashboard size={18} />
                    {t("footer_dashboard")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/admin/edit-account")}
                    className="flex items-center gap-3 w-full min-h-[44px] px-3 rounded-md text-base text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                  >
                    <Pencil size={18} />
                    {t("edit_account")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/account/change-password")}
                    className="flex items-center gap-3 w-full min-h-[44px] px-3 rounded-md text-base text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                  >
                    <Lock size={18} />
                    {t("change_password")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full min-h-[44px] px-3 rounded-md text-base text-orange-300 hover:text-orange-200 hover:bg-orange-500/10 transition-colors duration-fast"
                  >
                    <LogOut size={18} />
                    {t("logout")}
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate("/account/login")}
                  className="flex items-center w-full min-h-[44px] px-3 rounded-md text-base text-graphite-100 hover:text-white hover:bg-white/5 transition-colors duration-fast"
                >
                  {t("sign_in")}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
