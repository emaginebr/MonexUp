import { useContext, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Search,
  Users,
} from "lucide-react";

import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { UserNetworkStatusEnum } from "../../DTO/Enum/UserNetworkStatusEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import UserNetworkSearchInfo from "../../DTO/Domain/UserNetworkSearchInfo";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import UserContext from "../../Contexts/User/UserContext";
import FormField from "../NetworkEditPage/FormField";

import UserSearchRow, {
  UserSearchRowHandlers,
  UserSearchRowLabels,
} from "./UserSearchRow";

/**
 * UserSearchPage — redesigned `/admin/teams` and `/admin/teams/:pageNum`.
 *
 * Visual contract: matches the editorial-brutalist light surface used by
 * ProfileListPage. Rendered inside `LayoutAdmin`, so this component does not
 * render any header chrome.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - reads `userContext.searchResult` and `userContext.loadingSearch`
 *   - calls `userContext.search(networkId, keyword, pageNum, null)` exactly
 *     like the legacy code (same arguments, same response handling)
 *   - keeps every per-row promote / demote / changeStatus call; after a
 *     successful action it re-runs `searchUsers(searchResult.pageNum)` so
 *     the page state is unchanged
 *   - uses MessageToast for success / error
 *   - translates roles + statuses via the existing `userSearchPage.*` keys
 *   - the legacy "Invite" button was disabled and routed nowhere, so the
 *     redesigned page intentionally does not render a primary CTA — the
 *     page header right cluster is empty until the legacy gains one
 */
export default function UserSearchPage() {
  const { t } = useTranslation();

  const userContext = useContext(UserContext);
  const networkContext = useContext(NetworkContext);

  const { pageNum } = useParams();

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  const throwError = (message: string) => {
    setDialog(MessageToastEnum.Error);
    setMessageText(message);
    setShowMessage(true);
  };
  const showSuccessMessage = (message: string) => {
    setDialog(MessageToastEnum.Success);
    setMessageText(message);
    setShowMessage(true);
  };

  const showRole = (role: UserRoleEnum): string => {
    switch (role) {
      case UserRoleEnum.NoRole:
        return t("userSearchPage.roles.noRole");
      case UserRoleEnum.User:
        return t("userSearchPage.roles.user");
      case UserRoleEnum.Seller:
        return t("userSearchPage.roles.seller");
      case UserRoleEnum.NetworkManager:
        return t("userSearchPage.roles.networkManager");
      case UserRoleEnum.Administrator:
        return t("userSearchPage.roles.administrator");
      default:
        return "";
    }
  };

  const showStatus = (status: UserNetworkStatusEnum): string => {
    switch (status) {
      case UserNetworkStatusEnum.Active:
        return t("userSearchPage.status.active");
      case UserNetworkStatusEnum.Blocked:
        return t("userSearchPage.status.blocked");
      case UserNetworkStatusEnum.Inactive:
        return t("userSearchPage.status.inactive");
      case UserNetworkStatusEnum.WaitForApproval:
        return t("userSearchPage.status.waitForApproval");
      default:
        return "";
    }
  };

  const searchUsers = (page: number, term?: string) => {
    if (!networkContext.userNetwork) return;
    userContext
      .search(
        networkContext.userNetwork.networkId,
        term ?? keyword,
        page,
        null
      )
      .then((ret) => {
        if (!ret.sucesso) {
          throwError(ret.mensagemErro);
        }
      });
  };

  useEffect(() => {
    if (networkContext.userNetwork) {
      let pageNumInt: number = parseInt(pageNum ?? "");
      if (!pageNumInt) {
        pageNumInt = 1;
      }
      searchUsers(pageNumInt, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NAuth's searchUsers doesn't carry MonexUp profile data. Pull the full
  // network team list once (already used elsewhere via networkContext) so we
  // can join `profile` per userId when rendering the row.
  useEffect(() => {
    const slug = networkContext.network?.slug;
    if (!slug) return;
    networkContext.listByNetwork(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkContext.network?.slug]);

  const profileByUserId = useMemo(() => {
    const map = new Map<number, string>();
    const teams = (networkContext as any).teams as any[] | undefined;
    if (!teams) return map;
    for (const t of teams) {
      const uid = t?.userId ?? t?.user?.userId;
      const name = t?.profile?.name || t?.profile?.title || "";
      if (uid && name) map.set(uid, name);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(networkContext as any).teams]);

  // -- Per-row action handlers (preserve legacy behavior verbatim) --------
  const refreshCurrentPage = () => {
    const current = userContext.searchResult?.pageNum ?? 1;
    searchUsers(current);
    // Also re-pull team list so profile chip reflects the new profile after
    // promote/demote (which change UserNetwork.ProfileId server-side).
    const slug = networkContext.network?.slug;
    if (slug) networkContext.listByNetwork(slug);
  };

  const handlers: UserSearchRowHandlers = {
    onPromote: async (user) => {
      const ret = await networkContext.promote(
        networkContext.network?.networkId,
        user.userId
      );
      if (ret.sucesso) {
        showSuccessMessage(t("userSearchPage.messages.userPromoted"));
        refreshCurrentPage();
      } else {
        throwError(ret.mensagemErro);
      }
    },
    onDemote: async (user) => {
      const ret = await networkContext.demote(
        networkContext.network?.networkId,
        user.userId
      );
      if (ret.sucesso) {
        showSuccessMessage(t("userSearchPage.messages.userDemoted"));
        refreshCurrentPage();
      } else {
        throwError(ret.mensagemErro);
      }
    },
    onRemove: async (user) => {
      const ret = await networkContext.changeStatus(
        networkContext.network?.networkId,
        user.userId,
        UserNetworkStatusEnum.Inactive
      );
      if (ret.sucesso) {
        showSuccessMessage(t("userSearchPage.messages.userAccessRemoved"));
        refreshCurrentPage();
      } else {
        throwError(ret.mensagemErro);
      }
    },
    onReactivate: async (user) => {
      const ret = await networkContext.changeStatus(
        networkContext.network?.networkId,
        user.userId,
        UserNetworkStatusEnum.Active
      );
      if (ret.sucesso) {
        showSuccessMessage(t("userSearchPage.messages.userReactivated"));
        refreshCurrentPage();
      } else {
        throwError(ret.mensagemErro);
      }
    },
    onBlock: async (user) => {
      const ret = await networkContext.changeStatus(
        networkContext.network?.networkId,
        user.userId,
        UserNetworkStatusEnum.Blocked
      );
      if (ret.sucesso) {
        showSuccessMessage(t("userSearchPage.messages.userBlocked"));
        refreshCurrentPage();
      } else {
        throwError(ret.mensagemErro);
      }
    },
    onApprove: async (user) => {
      const ret = await networkContext.changeStatus(
        networkContext.network?.networkId,
        user.userId,
        UserNetworkStatusEnum.Active
      );
      if (ret.sucesso) {
        showSuccessMessage(t("userSearchPage.messages.userApproved"));
        refreshCurrentPage();
      } else {
        throwError(ret.mensagemErro);
      }
    },
    onReprove: async (user) => {
      const ret = await networkContext.changeStatus(
        networkContext.network?.networkId,
        user.userId,
        UserNetworkStatusEnum.Inactive
      );
      if (ret.sucesso) {
        showSuccessMessage(t("userSearchPage.messages.userReproved"));
        refreshCurrentPage();
      } else {
        throwError(ret.mensagemErro);
      }
    },
  };

  const onSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    searchUsers(1);
  };

  // -- Derived state -------------------------------------------------------
  const result = userContext.searchResult;
  const users: UserNetworkSearchInfo[] = result?.users ?? [];
  const isLoading = userContext.loadingSearch;
  const isEmpty = !isLoading && users.length === 0;

  const currentPage =
    result?.pageNum ?? result?.page ?? 1;
  const totalPages =
    result?.pageCount ?? result?.totalPages ?? 1;
  const showPagination = !isLoading && !!result && totalPages > 1;
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const baseRowLabels = {
    roleLabel: t("userSearchPage.tableHeaders.role"),
    statusLabel: t("userSearchPage.tableHeaders.status"),
    profileLabel: t("userSearchPage.tableHeaders.profile", "Perfil"),
    profileMissing: t("userSearchPage.profileMissing", "Sem perfil"),
    promote: t("userSearchPage.actions.promote"),
    demote: t("userSearchPage.actions.demote"),
    remove: t("userSearchPage.actions.remove"),
    reactivate: t("userSearchPage.actions.reactivate"),
    block: t("userSearchPage.actions.block"),
    approve: t("userSearchPage.actions.approve"),
    reprove: t("userSearchPage.actions.reprove"),
    viewStorefront: t("userSearchPage.actions.viewStorefront"),
    viewStorefrontMissingNetwork: t("userSearchPage.actions.viewStorefrontMissingNetwork"),
    viewStorefrontMissingSeller: t("userSearchPage.actions.viewStorefrontMissingSeller"),
  };

  const networkSlug = networkContext.network?.slug;

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={dialog}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />

      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band ------------------------------------------ */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="user-search-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="user-search-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("teams")}
              </h1>
            </div>
            <nav aria-label="Breadcrumb" className="mt-2 ml-[14px] text-sm">
              <ol className="flex items-center gap-1 text-graphite-500">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-orange-600 transition-colors duration-fast"
                  >
                    {t("userSearchPage.breadcrumbs.myNetwork")}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-graphite-300">
                  <ChevronRight size={14} />
                </li>
                <li
                  aria-current="page"
                  className="font-medium text-graphite-700 truncate max-w-[14rem]"
                >
                  {t("teams")}
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled
              className="cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
              aria-disabled="true"
            >
              <Mail size={16} aria-hidden="true" />
              {t("userSearchPage.inviteButton")}
            </button>
          </div>
        </section>

        {/* 2. Search + table card --------------------------------------- */}
        <section
          aria-label={t("teams")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {/* Toolbar ---------------------------------------------------- */}
          <form
            onSubmit={onSearchSubmit}
            className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
          >
            <div className="w-full sm:max-w-sm">
              <FormField
                id="user-search-keyword"
                label={t("userSearchPage.tableHeaders.seller")}
                icon={Search}
              >
                <input
                  id="user-search-keyword"
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t("userSearchPage.searchPlaceholder")}
                  aria-label={t("userSearchPage.searchPlaceholder")}
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
                  className="col-span-4 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("userSearchPage.tableHeaders.seller")}
                </div>
                <div
                  className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("userSearchPage.tableHeaders.profile", "Perfil")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("userSearchPage.tableHeaders.role")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("userSearchPage.tableHeaders.status")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  <span className="sr-only">
                    {t("userSearchPage.tableHeaders.actions")}
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
                    <div className="col-span-4 flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="col-span-2 h-5 w-20 rounded-full" />
                    <Skeleton className="col-span-2 h-5 ml-auto w-24 rounded-full" />
                    <Skeleton className="col-span-2 h-5 ml-auto w-20 rounded-full" />
                    <Skeleton className="col-span-2 h-4 ml-auto w-28" />
                  </div>
                ))}
                {[0, 1, 2].map((idx) => (
                  <div
                    key={`m-${idx}`}
                    className="px-4 py-4 md:hidden space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
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
                  <Users size={22} />
                </span>
                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                  {t("userSearchPage.emptyTitle")}
                </h3>
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                  {t("userSearchPage.emptyBody")}
                </p>
              </div>
            )}

            {/* Rows -------------------------------------------------- */}
            {!isLoading && !isEmpty && (
              <div role="rowgroup">
                {users.map((user) => {
                  const labels: UserSearchRowLabels = {
                    ...baseRowLabels,
                    roleText: showRole(user.role),
                    statusText: showStatus(user.status),
                  };
                  // Enrich the NAuth-search user with the MonexUp profile name
                  // pulled from networkContext.teams (loaded above).
                  const enriched = {
                    ...user,
                    profile: user.profile || profileByUserId.get(user.userId) || "",
                  };
                  return (
                    <UserSearchRow
                      key={`${user.userId}-${user.networkId}`}
                      user={enriched}
                      labels={labels}
                      handlers={handlers}
                      networkSlug={networkSlug}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination footer ----------------------------------------- */}
          {showPagination && (
            <nav
              aria-label="Pagination"
              className="mt-4 flex items-center justify-between gap-3"
            >
              <button
                type="button"
                onClick={() => searchUsers(currentPage - 1)}
                disabled={!canPrev}
                className="inline-flex h-9 items-center gap-1 px-3 rounded-md text-sm font-medium text-graphite-700 hover:bg-mnx-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>{t("userSearchPage.actions.previous")}</span>
              </button>

              <span className="text-xs text-graphite-500 mnx-num tabular-nums">
                {t("userSearchPage.pageOf", {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>

              <button
                type="button"
                onClick={() => searchUsers(currentPage + 1)}
                disabled={!canNext}
                className="inline-flex h-9 items-center gap-1 px-3 rounded-md text-sm font-medium text-graphite-700 hover:bg-mnx-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span>{t("userSearchPage.actions.next")}</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
