import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Settings,
  Network as NetworkIcon,
  Users,
  ListOrdered,
  DollarSign,
  UserCog,
  Lock,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Briefcase,
  ChevronDown,
  Search,
  Package,
  Tag,
  Share2,
} from "lucide-react";
import { useIsAdmin } from "../Hooks/useIsAdmin";

import AuthContext from "../Contexts/Auth/AuthContext";
import NetworkContext from "../Contexts/Network/NetworkContext";
import InvoiceContext from "../Contexts/Invoice/InvoiceContext";
import { UserRoleEnum } from "../DTO/Enum/UserRoleEnum";
import StatementSearchParam from "../DTO/Domain/StatementSearchParam";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";

/**
 * AdminSidebar — editorial-brutalist dark navigation rail for `/admin/**`.
 *
 * Lives BENEATH the global dark Header (`Pages/HomePage/Header.tsx`),
 * which is injected by `LayoutAdmin` in `App.tsx`. Sticks at the
 * Header's bottom edge (`top: h-16 lg:h-20`) so it scrolls independently
 * while staying glued to the navbar.
 *
 * Visual language matches the Header / DashboardPage / NetworkEditPage
 * redesigns:
 *   - dark glassy surface tinted with `rgba(10, 10, 13, 0.85)`
 *   - thin `border-white/5` separators
 *   - faint mesh grid backdrop (auth-grid)
 *   - active rows: 3px orange left bar + `bg-white/5` + `shadow-glow-sm`
 *   - eyebrow group labels in uppercase graphite-400
 *
 * Behavior:
 *   - parity with the legacy sidebar links (every href + i18n key
 *     preserved, role-gating preserved)
 *   - adds the safe per-user defaults present in the Header user-menu:
 *     `edit_account` and `change_password`
 *   - collapses to a 64px icon rail on `<lg`, expands to 260px on `lg+`
 *   - persists collapsed state under `mnx.adminSidebar.collapsed`
 *   - chevron toggle in the header strip flips state and switches icon
 *   - footer hosts logout (reuses `authContext.logout()` + `navigate(0)`
 *     like the Header user menu) and an optional version chip pulled
 *     from `import.meta.env.VITE_APP_VERSION`
 */

const STORAGE_KEY = "mnx.adminSidebar.collapsed";
const HEADER_HEIGHT_CLASSES = "top-16 lg:top-20";
// Cap the sidebar height to the viewport minus the global Header, but never
// produce its own scrollbar — the document scroll is the only scroll. If the
// nav is taller than this cap, excess content is clipped via `overflow-hidden`.
const HEADER_OFFSET_HEIGHT_CLASSES =
  "max-h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-5rem)]";

export default function AdminSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);
  const invoiceContext = useContext(InvoiceContext);
  const isAdmin = useIsAdmin();

  // --- Collapsed state ----------------------------------------------------
  // Default: expanded on desktop, collapsed on narrow viewports. The user's
  // explicit choice is persisted in localStorage and overrides the default.
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) return stored === "1";
    } catch {
      /* localStorage may be unavailable (SSR / privacy mode); fall through */
    }
    return window.matchMedia("(max-width: 1023.98px)").matches;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* swallow — non-essential */
    }
  }, [collapsed]);

  // --- Active matching ----------------------------------------------------
  // Same predicate as the legacy sidebar so deep links stay highlighted.
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const isDashboardActive =
    location.pathname === "/admin" || isActive("/admin/dashboard");

  // --- Role switch handlers (parity with legacy Header role dropdown) ----
  const switchRole = async (target: UserRoleEnum) => {
    if (!networkContext) return;
    networkContext.setCurrentRole(target);
    if (target === UserRoleEnum.Seller) {
      await invoiceContext?.getBalance?.();
      await invoiceContext?.getAvailableBalance?.();
      const param: StatementSearchParam = {
        userId: networkContext.userNetwork?.userId,
        pageNum: 1,
      } as StatementSearchParam;
      await invoiceContext?.searchStatement?.(param);
    } else if (target === UserRoleEnum.NetworkManager) {
      await invoiceContext?.getBalance?.(networkContext.userNetwork?.networkId);
      const param: StatementSearchParam = {
        networkId: networkContext.userNetwork?.networkId,
        pageNum: 1,
      } as StatementSearchParam;
      await invoiceContext?.searchStatement?.(param);
    }
    navigate("/admin/dashboard");
  };

  // --- Logout (mirrors Header behavior so role/cache state is reset) -----
  const handleLogout = () => {
    const ret = authContext?.logout?.();
    if (ret?.sucesso) {
      navigate(0);
    } else {
      // If logout fails we still bounce to login so the UI doesn't feel stuck.
      navigate("/account/login");
    }
  };

  // --- Role chip ----------------------------------------------------------
  const role = networkContext?.currentRole;
  const roleKey =
    role === UserRoleEnum.Administrator
      ? "administrator"
      : role === UserRoleEnum.NetworkManager
      ? "network_manager"
      : role === UserRoleEnum.Seller
      ? "seller"
      : role === UserRoleEnum.User
      ? "user"
      : null;
  const roleLabel = roleKey ? t(roleKey) : null;
  const networkName = networkContext?.userNetwork?.network?.name;

  // --- Role selector chip dropdown ---------------------------------------
  const [roleOpen, setRoleOpen] = useState<boolean>(false);
  const roleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!roleOpen) return;
    const onDocClick = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRoleOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [roleOpen]);

  // --- App version (Vite env, optional) -----------------------------------
  const appVersion =
    (import.meta as any).env?.VITE_APP_VERSION ?? null;

  const widthClasses = collapsed ? "w-16" : "w-[260px]";

  return (
    <aside
      aria-label={t("footer_dashboard")}
      className={[
        "mnx-surface-dark relative",
        "shrink-0 border-r border-white/5 backdrop-blur-md",
        "flex flex-col",
        "transition-[width] duration-normal ease-standard",
        widthClasses,
      ].join(" ")}
      style={{ background: "rgba(10, 10, 13, 0.85)" }}
    >
      {/* Faint mesh backdrop — same vocabulary as the auth surface and
          the home hero. Pointer-events disabled so it never blocks clicks. */}
      <div
        aria-hidden="true"
        className="auth-grid pointer-events-none absolute inset-0 opacity-60"
      />

      {/* ------------------------------------------------------------------
          1. Collapse toggle
         ------------------------------------------------------------------ */}
      <div
        className={[
          "relative flex items-center border-b border-white/5",
          collapsed ? "justify-center px-0 py-3" : "justify-end px-3 py-3",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={t("footer_dashboard")}
          aria-expanded={!collapsed}
          aria-controls="mnx-admin-sidebar-nav"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-graphite-300 hover:text-white hover:bg-white/5 transition-colors duration-fast"
        >
          {collapsed ? (
            <ChevronsRight size={16} aria-hidden="true" />
          ) : (
            <ChevronsLeft size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------------
          3. Nav groups
         ------------------------------------------------------------------ */}
      <nav
        id="mnx-admin-sidebar-nav"
        className="relative px-2 pb-3"
      >
        {/* Role switcher — chip styled like the prior network selector. */}
        {networkContext?.userNetwork && (
          <div
            className={collapsed ? "px-1 pb-3" : "px-1 pb-3"}
            ref={roleRef}
          >
            {collapsed ? (
              <button
                type="button"
                onClick={() => setRoleOpen((o) => !o)}
                title={`${t("role_description")} · ${roleLabel ?? ""}`}
                className="mx-auto inline-flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30 hover:bg-orange-500/25 transition-colors duration-fast"
                aria-haspopup="menu"
                aria-expanded={roleOpen}
                aria-label={roleLabel ?? t("role_description")}
              >
                <ShieldCheck size={15} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRoleOpen((o) => !o)}
                className="w-full text-left rounded-md bg-orange-500/10 ring-1 ring-orange-500/25 px-3 py-2 hover:bg-orange-500/15 transition-colors duration-fast"
                aria-haspopup="menu"
                aria-expanded={roleOpen}
              >
                <p className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider font-semibold text-orange-300">
                  <ShieldCheck size={12} aria-hidden="true" />
                  <span className="flex-1 truncate">{t("role_description")}</span>
                  <ChevronDown
                    size={12}
                    aria-hidden="true"
                    className={`transition-transform duration-fast ${roleOpen ? "rotate-180" : ""}`}
                  />
                </p>
                <p className="mt-0.5 text-sm font-medium text-white truncate">
                  {roleLabel ?? "—"}
                </p>
              </button>
            )}

            {roleOpen && (
              <div
                role="menu"
                className={[
                  "absolute z-30 mt-2 w-60 rounded-lg border border-white/10 shadow-xl overflow-hidden",
                  collapsed ? "left-full ml-2 top-0" : "left-3 right-3 w-auto",
                ].join(" ")}
                style={{ background: "rgba(15, 15, 19, 0.98)" }}
              >
                <ul className="py-1">
                  {networkContext.userNetwork.role >= UserRoleEnum.User && (
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setRoleOpen(false); switchRole(UserRoleEnum.User); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-fast ${role === UserRoleEnum.User ? "bg-white/5 text-white" : "text-graphite-100 hover:text-white hover:bg-white/5"}`}
                      >
                        <ShieldCheck size={16} className="text-graphite-300" />
                        {t("user")}
                      </button>
                    </li>
                  )}
                  {networkContext.userNetwork.role >= UserRoleEnum.Seller && (
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setRoleOpen(false); switchRole(UserRoleEnum.Seller); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-fast ${role === UserRoleEnum.Seller ? "bg-white/5 text-white" : "text-graphite-100 hover:text-white hover:bg-white/5"}`}
                      >
                        <ShieldCheck size={16} className="text-graphite-300" />
                        {t("seller")}
                      </button>
                    </li>
                  )}
                  {networkContext.userNetwork.role >= UserRoleEnum.NetworkManager && (
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setRoleOpen(false); switchRole(UserRoleEnum.NetworkManager); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-fast ${role === UserRoleEnum.NetworkManager ? "bg-white/5 text-white" : "text-graphite-100 hover:text-white hover:bg-white/5"}`}
                      >
                        <ShieldCheck size={16} className="text-graphite-300" />
                        {t("network_manager")}
                      </button>
                    </li>
                  )}
                  {networkContext.userNetwork.role >= UserRoleEnum.Administrator && (
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setRoleOpen(false); switchRole(UserRoleEnum.Administrator); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-fast ${role === UserRoleEnum.Administrator ? "bg-white/5 text-white" : "text-graphite-100 hover:text-white hover:bg-white/5"}`}
                      >
                        <ShieldCheck size={16} className="text-graphite-300" />
                        {t("administrator")}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* My Network — Painel + manager-only items */}
        <SidebarGroup label={t("my_network")} collapsed={collapsed}>
          <SidebarItem
            icon={LayoutDashboard}
            label={t("footer_dashboard")}
            active={isDashboardActive}
            collapsed={collapsed}
            onClick={() => navigate("/admin/dashboard")}
          />
          {role >= UserRoleEnum.NetworkManager && (
            <>
              <SidebarItem
                icon={Settings}
                label={t("preferences")}
                active={isActive("/admin/network")}
                collapsed={collapsed}
                onClick={() => navigate("/admin/network")}
              />
              <SidebarItem
                icon={NetworkIcon}
                label={t("team_structure")}
                active={isActive("/admin/team-structure")}
                collapsed={collapsed}
                onClick={() => navigate("/admin/team-structure")}
              />
              <SidebarItem
                icon={Users}
                label={t("teams")}
                active={isActive("/admin/teams")}
                collapsed={collapsed}
                onClick={() => navigate("/admin/teams")}
              />
              <SidebarItem
                icon={Share2}
                label={t("hierarchy")}
                active={isActive("/admin/hierarchy")}
                collapsed={collapsed}
                onClick={() => navigate("/admin/hierarchy")}
              />
            </>
          )}
        </SidebarGroup>

        {/* NetworkManager+ — catalog cluster */}
        {role >= UserRoleEnum.NetworkManager && (
          <SidebarGroup label={t("admin_catalog", "Catálogo")} collapsed={collapsed}>
            <SidebarItem
              icon={Package}
              label={t("admin_product_title", "Produtos")}
              active={isActive("/admin/products")}
              collapsed={collapsed}
              onClick={() => navigate("/admin/products")}
            />
            <SidebarItem
              icon={Tag}
              label={t("admin_category_title", "Categorias")}
              active={isActive("/admin/categories")}
              collapsed={collapsed}
              onClick={() => navigate("/admin/categories")}
            />
          </SidebarGroup>
        )}

        {/* Seller+ — finances cluster */}
        {role >= UserRoleEnum.Seller && (
          <SidebarGroup label={t("finances")} collapsed={collapsed}>
            <SidebarItem
              icon={ListOrdered}
              label={t("orders")}
              active={isActive("/admin/orders")}
              collapsed={collapsed}
              onClick={() => navigate("/admin/orders")}
            />
            {role >= UserRoleEnum.NetworkManager && (
              <SidebarItem
                icon={DollarSign}
                label={t("billing", "Cobranças")}
                active={isActive("/admin/billing")}
                collapsed={collapsed}
                onClick={() => navigate("/admin/billing")}
              />
            )}
          </SidebarGroup>
        )}

        {/* Account — universal, mirrors the Header user menu so admins
            don't have to leave the sidebar to update their profile */}
        <SidebarGroup label={t("admin_sidebar_account")} collapsed={collapsed}>
          <SidebarItem
            icon={UserCog}
            label={t("edit_account")}
            active={isActive("/admin/edit-account")}
            collapsed={collapsed}
            onClick={() => navigate("/admin/edit-account")}
          />
          <SidebarItem
            icon={Lock}
            label={t("change_password")}
            active={location.pathname === "/account/change-password"}
            collapsed={collapsed}
            onClick={() => navigate("/account/change-password")}
          />
          <SidebarItem
            icon={LogOut}
            label={t("logout")}
            active={false}
            collapsed={collapsed}
            onClick={handleLogout}
          />
        </SidebarGroup>

        {appVersion && !collapsed && (
          <p className="mt-3 px-3 text-[0.65rem] uppercase tracking-wider text-graphite-500">
            v{appVersion}
          </p>
        )}
      </nav>

    </aside>
  );
}
