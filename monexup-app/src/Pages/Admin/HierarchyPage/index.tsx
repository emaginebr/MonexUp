import { useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Share2, Plus, MoveUp } from "lucide-react";

import { Skeleton } from "../../../Components/ui/skeleton";
import NetworkContext from "../../../Contexts/Network/NetworkContext";
import { UserNetworkStatusEnum } from "../../../DTO/Enum/UserNetworkStatusEnum";
import { UserRoleEnum } from "../../../DTO/Enum/UserRoleEnum";

import {
  DescendantTree,
  HierarchyLabels,
  NodeCard,
  seedExpanded,
} from "./TreeNode";
import "./hierarchy.css";

/**
 * HierarchyPage — `/admin/hierarchy` ("Árvore Hierárquica").
 *
 * Renders the member graph rooted at the logged-in user for the active
 * network: the referrer chain above (ancestors, top → sponsor), the current
 * user highlighted in the center, and the invitee tree below (descendants,
 * ≤3 levels). Reads the active network from `NetworkContext` and fetches via
 * `networkContext.getHierarchy(networkId)` — the page never calls the API
 * directly. Rendered inside `LayoutAdmin`, so it owns no sidebar/header chrome.
 *
 * Behavior mirrors `UserSearchPage`: light editorial-brutalist surface, no
 * in-component role guard (access is gated by the sidebar item visibility).
 */
export default function HierarchyPage() {
  const { t } = useTranslation();
  const networkContext = useContext(NetworkContext);

  const networkId =
    networkContext?.userNetwork?.networkId ??
    networkContext?.network?.networkId ??
    null;

  const view = networkContext?.hierarchy ?? null;
  const isLoading = networkContext?.loadingHierarchy ?? false;

  const [error, setError] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [focusedId, setFocusedId] = useState<number | null>(null);

  // Fetch whenever the active network changes.
  useEffect(() => {
    if (networkId == null) return;
    setError("");
    networkContext.getHierarchy(networkId).then((ret) => {
      if (!ret.sucesso) {
        setError(ret.mensagemErro || t("hierarchyPage.loadError"));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId]);

  // Seed the expand set + initial roving focus once a view arrives.
  useEffect(() => {
    if (!view) return;
    setExpanded(seedExpanded(view));
    setFocusedId(view.descendants?.[0]?.userId ?? null);
  }, [view]);

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

  const labels: HierarchyLabels = useMemo(
    () => ({
      you: t("hierarchyPage.you"),
      profileMissing: t("userSearchPage.profileMissing"),
      childrenLabel: t("hierarchyPage.childrenLabel"),
      collapse: t("hierarchyPage.collapse"),
      roleText: showRole,
      statusText: showStatus,
      expandChildren: (count: number) =>
        t("hierarchyPage.expandChildren", { count }),
      collapsedSummary: (count: number) =>
        t("hierarchyPage.collapsedSummary", { count }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  const onToggle = (userId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // ancestors arrive immediate-sponsor first; render top → sponsor.
  const ancestorsTopDown = useMemo(
    () => (view?.ancestors ? [...view.ancestors].reverse() : []),
    [view]
  );
  const hasAncestors = ancestorsTopDown.length > 0;
  const descendants = view?.descendants ?? [];
  const hasDescendants = descendants.length > 0;
  const currentName = view?.current?.name || "—";

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band ------------------------------------------ */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="hierarchy-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="hierarchy-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("hierarchyPage.title")}
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
                  {t("hierarchyPage.breadcrumb")}
                </li>
              </ol>
            </nav>
          </div>
        </section>

        {/* 2. Tree body ------------------------------------------------- */}
        <section
          aria-label={t("hierarchyPage.title")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {/* Loading skeleton --------------------------------------- */}
          {isLoading && (
            <div
              aria-busy="true"
              aria-label={t("hierarchyPage.loading")}
              className="flex flex-col items-center gap-[22px] py-6"
            >
              <NodeSkeleton />
              <span className="mnx-hier-link-v" aria-hidden="true" />
              <NodeSkeleton />
              <span className="mnx-hier-link-v" aria-hidden="true" />
              <NodeSkeleton current />
              <span className="mnx-hier-link-v" aria-hidden="true" />
              <div className="flex flex-wrap justify-center gap-5">
                <NodeSkeleton />
                <NodeSkeleton />
                <NodeSkeleton />
              </div>
            </div>
          )}

          {/* Error state -------------------------------------------- */}
          {!isLoading && error && (
            <div className="px-6 py-14 text-center" role="alert">
              <span
                className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
                aria-hidden="true"
              >
                <Share2 size={22} />
              </span>
              <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                {t("hierarchyPage.errorTitle")}
              </h3>
              <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Populated ---------------------------------------------- */}
          {!isLoading && !error && view && (
            <div className="flex flex-col items-center">
              {/* Ancestors (chain above) */}
              {hasAncestors ? (
                <div
                  role="group"
                  aria-label={t("hierarchyPage.ancestorsLabel")}
                  className="flex flex-col items-center"
                >
                  <span
                    className="inline-flex items-center gap-1.5 mb-2.5 h-6 px-2.5 rounded-full bg-mnx-neutral-100 text-graphite-500 text-[11px] font-semibold border border-dashed border-mnx-neutral-300"
                    aria-hidden="true"
                  >
                    <MoveUp size={12} />
                    {t("hierarchyPage.topOfTree")}
                  </span>
                  {ancestorsTopDown.map((ancestor) => (
                    <div
                      key={ancestor.userId}
                      className="flex flex-col items-center"
                    >
                      <NodeCard
                        node={ancestor}
                        variant="ancestor"
                        labels={labels}
                      />
                      <span
                        className="mnx-hier-link-v mnx-hier-link-v--arrow"
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock
                  icon={<MoveUp size={22} />}
                  title={t("hierarchyPage.emptyAncestorsTitle")}
                  body={t("hierarchyPage.emptyAncestorsBody")}
                />
              )}

              {/* Current user (highlighted center) */}
              <NodeCard node={view.current} variant="current" labels={labels} />

              {/* Descendants (tree below) */}
              {hasDescendants ? (
                <>
                  <span
                    className="mnx-hier-link-v mt-[22px]"
                    aria-hidden="true"
                  />
                  <div className="mnx-hier-scroll w-full flex justify-center">
                    <DescendantTree
                      roots={descendants}
                      expanded={expanded}
                      onToggle={onToggle}
                      labels={labels}
                      ariaLabel={t("hierarchyPage.descendantsLabel", {
                        name: currentName,
                      })}
                      focusedId={focusedId}
                      setFocusedId={setFocusedId}
                    />
                  </div>
                </>
              ) : (
                <>
                  <span
                    className="mnx-hier-link-v mt-[22px]"
                    aria-hidden="true"
                  />
                  <EmptyBlock
                    icon={<Plus size={22} />}
                    title={t("hierarchyPage.emptyDescendantsTitle")}
                    body={t("hierarchyPage.emptyDescendantsBody")}
                  />
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* Local presentational helpers --------------------------------------------- */

function EmptyBlock({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="text-center py-8 px-6">
      <span
        className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
        aria-hidden="true"
      >
        {icon}
      </span>
      <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
        {title}
      </h3>
      <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function NodeSkeleton({ current }: { current?: boolean }) {
  return (
    <div
      className={`w-[210px] sm:w-[236px] rounded-xl border p-3 ${
        current
          ? "border-orange-200 ring-2 ring-orange-200"
          : "border-mnx-neutral-200"
      } bg-white shadow-md`}
    >
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-[34px] h-[34px] rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-3/5" />
          <Skeleton className="h-2 w-2/5" />
        </div>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        <Skeleton className="h-[22px] w-[74px] rounded-full" />
        <Skeleton className="h-[22px] w-[52px] rounded-full" />
      </div>
    </div>
  );
}
