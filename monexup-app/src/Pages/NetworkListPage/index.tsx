import { useContext, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Plus, Search } from "lucide-react";

import NetworkContext from "../../Contexts/Network/NetworkContext";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import UserNetworkInfo from "../../DTO/Domain/UserNetworkInfo";
import FormField from "../NetworkEditPage/FormField";

import NetworkListRow, { NetworkListRowLabels } from "./NetworkListRow";

/**
 * NetworkListPage — redesigned `/network/search` route.
 *
 * Visual contract: matches the editorial-brutalist light surface used by
 * ProfileListPage and UserSearchPage — compact page header (2px orange
 * accent + `display-headline` h1 + breadcrumb in the `ml-[14px]` slot)
 * followed by a single `auth-card` body containing a search toolbar and
 * a 12-column grid table on `md+` that collapses to a stacked card on
 * `<md`. Rendered inside `LayoutAdmin`, which already injects the
 * `HomeHeader` + admin sidebar — this component intentionally does NOT
 * render any header chrome.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - calls `networkContext.listByUser()` on mount and surfaces errors
 *     through `MessageToast`
 *   - reads `networkContext.userNetworks` and `networkContext.loading`
 *   - clicking a network name calls `networkContext.setNetwork(...)` and
 *     navigates to `/admin/dashboard` (the legacy "select network" path)
 *   - the public landing link `/{slug}` is preserved as the `Eye` action
 *   - manage (Pencil) is gated to the network the user currently has
 *     selected as their `userNetwork` (`userNetwork.networkId === networkId`)
 *   - the search input is a client-side filter over the loaded list
 *     (the legacy did not call a server endpoint either; the legacy
 *     button was a visual no-op)
 */
export default function NetworkListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const networkContext = useContext(NetworkContext);

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  const throwError = (message: string) => {
    setMessageText(message);
    setShowMessage(true);
  };

  useEffect(() => {
    networkContext.listByUser().then((ret) => {
      if (!ret.sucesso) {
        throwError(ret.mensagemErro);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- Derived state -------------------------------------------------------
  const userNetworks: UserNetworkInfo[] = networkContext.userNetworks ?? [];
  const isLoading = networkContext.loading;

  const filtered = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    if (!term) return userNetworks;
    return userNetworks.filter((un) => {
      const n = un.network;
      if (!n) return false;
      return (
        (n.name ?? "").toLowerCase().includes(term) ||
        (n.slug ?? "").toLowerCase().includes(term)
      );
    });
  }, [userNetworks, keyword]);

  const isEmpty = !isLoading && filtered.length === 0;

  const onSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    // Filtering is reactive via useMemo; submit just blurs/keeps state.
  };

  const handleSelect = (un: UserNetworkInfo) => {
    networkContext.setNetwork(un.network);
    navigate("/admin/dashboard");
  };

  const goToCreate = () => navigate("/network");

  const rowLabels: NetworkListRowLabels = {
    network: t("network_list_header_network"),
    members: t("network_list_header_members"),
    commission: t("network_list_header_commission"),
    open: t("networkListPage.open"),
    manage: t("networkListPage.manage"),
  };

  const selectedNetworkId = networkContext.userNetwork?.networkId;

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={MessageToastEnum.Error}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />

      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band ------------------------------------------ */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="network-list-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="network-list-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("search_for_a_network")}
              </h1>
            </div>
            <nav aria-label="Breadcrumb" className="mt-2 ml-[14px] text-sm">
              <ol className="flex items-center gap-1 text-graphite-500">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-orange-600 transition-colors duration-fast"
                  >
                    {t("profileListPage.myNetwork")}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-graphite-300">
                  <ChevronRight size={14} />
                </li>
                <li
                  aria-current="page"
                  className="font-medium text-graphite-700 truncate max-w-[14rem]"
                >
                  {t("networkListPage.breadcrumbCurrent")}
                </li>
              </ol>
            </nav>
          </div>

          {/* Right action cluster intentionally empty — the legacy list
              page never exposed a "Create network" CTA in the header.
              The empty-state CTA below covers the recovery affordance. */}
        </section>

        {/* 2. Search + table card --------------------------------------- */}
        <section
          aria-label={t("search_for_a_network")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {/* Toolbar ---------------------------------------------------- */}
          <form
            onSubmit={onSearchSubmit}
            className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
          >
            <div className="w-full sm:max-w-sm">
              <FormField
                id="network-search-keyword"
                label={t("networkListPage.searchLabel")}
                icon={Search}
              >
                <input
                  id="network-search-keyword"
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t("networkListPage.searchPlaceholder")}
                  aria-label={t("network_list_search_aria_label")}
                  className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 placeholder:text-graphite-400 focus:outline-none pr-3"
                />
              </FormField>
            </div>
          </form>

          {/* Table ------------------------------------------------------ */}
          <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
            {/* Desktop column header --------------------------------- */}
            {!isEmpty && (
              <div
                className="hidden md:!grid grid-cols-12 gap-4 px-4 h-11 items-center bg-mnx-neutral-50 border-b border-mnx-neutral-200"
                role="row"
              >
                <div
                  className="col-span-6 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("network_list_header_network")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("network_list_header_members")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("network_list_header_commission")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  <span className="sr-only">
                    {t("network_list_header_actions")}
                  </span>
                </div>
              </div>
            )}

            {/* Loading state ----------------------------------------- */}
            {isLoading && (
              <div className="divide-y divide-mnx-neutral-100" aria-busy="true">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="px-4 h-14 hidden md:!grid grid-cols-12 items-center gap-4"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                    <Skeleton className="col-span-2 h-4 ml-auto w-16" />
                    <Skeleton className="col-span-2 h-4 ml-auto w-12" />
                    <Skeleton className="col-span-2 h-4 ml-auto w-20" />
                  </div>
                ))}
                {[0, 1, 2].map((idx) => (
                  <div
                    key={`m-${idx}`}
                    className="px-4 py-4 md:hidden space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state ------------------------------------------- */}
            {isEmpty && (
              <div className="px-6 py-14 text-center">
                <span
                  className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
                  aria-hidden="true"
                >
                  <Search size={22} />
                </span>
                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                  {t("networkListPage.emptyTitle")}
                </h3>
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                  {t("networkListPage.emptyBody")}
                </p>
                <button
                  type="button"
                  onClick={goToCreate}
                  className="cta-primary inline-flex h-10 items-center gap-2 px-5 mt-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast"
                >
                  <Plus size={16} aria-hidden="true" />
                  {t("networkListPage.createNetwork")}
                </button>
              </div>
            )}

            {/* Rows -------------------------------------------------- */}
            {!isLoading && !isEmpty && (
              <div role="rowgroup">
                {filtered.map((un) => (
                  <NetworkListRow
                    key={un.networkId}
                    userNetwork={un}
                    canManage={selectedNetworkId === un.networkId}
                    labels={rowLabels}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
