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
} from "lucide-react";

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

  // --- Network selector ---------------------------------------------------
  const [netSelOpen, setNetSelOpen] = useState<boolean>(false);
  const netSelRef = useRef<HTMLDivElement | null>(null);
  const userNetworks = networkContext?.userNetworks ?? [];

  useEffect(() => {
    if (!netSelOpen) return;
    const onDocClick = (event: MouseEvent) => {
      if (netSelRef.current && !netSelRef.current.contains(event.target as Node)) {
        setNetSelOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNetSelOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [netSelOpen]);

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
          1. Network selector + collapse toggle (combined row)
         ------------------------------------------------------------------ */}
      {(roleLabel || networkName) && (
        <div
          className={[
            "relative flex items-stretch gap-2",
            collapsed ? "flex-col px-2 py-3" : "px-3 py-3",
          ].join(" ")}
          ref={netSelRef}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={() => userNetworks.length > 0 && setNetSelOpen((o) => !o)}
              title={`${networkName ?? t("no_network_selected")}${roleLabel ? ` · ${roleLabel}` : ""}`}
              className="mx-auto inline-flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30 hover:bg-orange-500/25 transition-colors duration-fast"
              aria-label={networkName ?? t("no_network_selected")}
              aria-haspopup={userNetworks.length > 0 ? "menu" : undefined}
              aria-expanded={netSelOpen}
            >
              <Briefcase size={15} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => userNetworks.length > 0 && setNetSelOpen((o) => !o)}
              className="flex-1 min-w-0 text-left rounded-md bg-orange-500/10 ring-1 ring-orange-500/25 px-3 py-2 hover:bg-orange-500/15 transition-colors duration-fast"
              aria-haspopup={userNetworks.length > 0 ? "menu" : undefined}
              aria-expanded={netSelOpen}
              disabled={userNetworks.length === 0}
            >
              <p className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider font-semibold text-orange-300">
                <ShieldCheck size={12} aria-hidden="true" />
                <span className="flex-1">{roleLabel}</span>
                {userNetworks.length > 0 && (
                  <ChevronDown
                    size={12}
                    aria-hidden="true"
                    className={`transition-transform duration-fast ${netSelOpen ? "rotate-180" : ""}`}
                  />
                )}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-white truncate">
                <Briefcase size={13} className="text-orange-300 shrink-0" aria-hidden="true" />
                <span className="truncate">{networkName ?? t("no_network_selected")}</span>
              </p>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={t("footer_dashboard")}
            aria-expanded={!collapsed}
            aria-controls="mnx-admin-sidebar-nav"
            className={[
              "inline-flex items-center justify-center rounded-md text-graphite-300 hover:text-white hover:bg-white/5 transition-colors duration-fast shrink-0",
              collapsed ? "mx-auto h-8 w-8" : "h-auto w-8",
            ].join(" ")}
          >
            {collapsed ? (
              <ChevronsRight size={16} aria-hidden="true" />
            ) : (
              <ChevronsLeft size={16} aria-hidden="true" />
            )}
          </button>

          {netSelOpen && userNetworks.length > 0 && (
            <div
              role="menu"
              className={[
                "absolute z-30 mt-2 w-72 rounded-lg border border-white/10 shadow-xl overflow-hidden",
                collapsed ? "left-full ml-2 top-0" : "left-3 right-3 w-auto",
              ].join(" ")}
              style={{ background: "rgba(15, 15, 19, 0.98)" }}
            >
              <p className="px-4 py-3 text-xs uppercase tracking-wider text-graphite-400 border-b border-white/5">
                {t("select_network_to_connect")}
              </p>
              <ul className="py-1">
                {userNetworks.map((un) => (
                  <li key={un.networkId}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        networkContext.setUserNetwork(un);
                        setNetSelOpen(false);
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
                  onClick={() => { setNetSelOpen(false); navigate("/network/search"); }}
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

      {/* ------------------------------------------------------------------
          3. Nav groups
         ------------------------------------------------------------------ */}
      <nav
        id="mnx-admin-sidebar-nav"
        className="relative px-2 pb-3"
      >
        {/* Role switcher — placed first so users pick role before navigating. */}
        {networkContext?.userNetwork && (
          <SidebarGroup label={t("role_description")} collapsed={collapsed}>
            {networkContext.userNetwork.role >= UserRoleEnum.User && (
              <SidebarItem
                icon={ShieldCheck}
                label={t("user")}
                active={role === UserRoleEnum.User}
                collapsed={collapsed}
                onClick={() => switchRole(UserRoleEnum.User)}
              />
            )}
            {networkContext.userNetwork.role >= UserRoleEnum.Seller && (
              <SidebarItem
                icon={ShieldCheck}
                label={t("seller")}
                active={role === UserRoleEnum.Seller}
                collapsed={collapsed}
                onClick={() => switchRole(UserRoleEnum.Seller)}
              />
            )}
            {networkContext.userNetwork.role >= UserRoleEnum.NetworkManager && (
              <SidebarItem
                icon={ShieldCheck}
                label={t("network_manager")}
                active={role === UserRoleEnum.NetworkManager}
                collapsed={collapsed}
                onClick={() => switchRole(UserRoleEnum.NetworkManager)}
              />
            )}
            {networkContext.userNetwork.role >= UserRoleEnum.Administrator && (
              <SidebarItem
                icon={ShieldCheck}
                label={t("administrator")}
                active={role === UserRoleEnum.Administrator}
                collapsed={collapsed}
                onClick={() => switchRole(UserRoleEnum.Administrator)}
              />
            )}
          </SidebarGroup>
        )}

        {/* Overview — every role sees this */}
        <SidebarGroup label={t("admin_sidebar_overview")} collapsed={collapsed}>
          <SidebarItem
            icon={LayoutDashboard}
            label={t("footer_dashboard")}
            active={isDashboardActive}
            collapsed={collapsed}
            onClick={() => navigate("/admin/dashboard")}
          />
        </SidebarGroup>

        {/* Network Manager — preferences / structure / teams */}
        {role >= UserRoleEnum.NetworkManager && (
          <SidebarGroup label={t("my_network")} collapsed={collapsed}>
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
            <SidebarItem
              icon={DollarSign}
              label={t("invoices")}
              active={isActive("/admin/invoices")}
              collapsed={collapsed}
              onClick={() => navigate("/admin/invoices")}
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
