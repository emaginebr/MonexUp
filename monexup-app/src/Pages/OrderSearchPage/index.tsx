import { useContext, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
} from "lucide-react";

import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import OrderContext from "../../Contexts/Order/OrderContext";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { OrderStatusEnum } from "../../DTO/Enum/OrderStatusEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import OrderInfo from "../../DTO/Domain/OrderInfo";
import FormField from "../NetworkEditPage/FormField";

import OrderSearchRow, { OrderSearchRowLabels } from "./OrderSearchRow";

/**
 * OrderSearchPage — redesigned `/admin/orders` route.
 *
 * Visual contract: matches the editorial-brutalist light surface used by
 * ProfileListPage / UserSearchPage / NetworkListPage. Rendered inside
 * `LayoutAdmin`, so this component does not render any header chrome.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - reads `orderContext.searchResult` and `orderContext.loadingSearch`
 *   - calls `orderContext.search(networkId, userId, sellerId, pageNum)` with
 *     the same role-gated argument tuple as the legacy page
 *     (NetworkManager → search by network only,
 *      Seller          → filter by sellerId = sessionInfo.userId,
 *      User            → filter by userId   = sessionInfo.userId)
 *   - keeps the per-page `:pageNum` URL parameter
 *   - shows error feedback through `MessageToast`
 *   - product name join + total computation match `showProducts` / `showTotal`
 *   - status text uses the existing `order_status_*` keys
 *   - the legacy "suspend" link routed back to `/admin/orders` as a
 *     placeholder, so this page omits it entirely. The Eye action links
 *     to `/admin/orders` until a per-order detail route exists.
 */
export default function OrderSearchPage() {
  const { t, i18n } = useTranslation();

  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);
  const orderContext = useContext(OrderContext);

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

  // Role-gated search — preserves legacy argument tuple verbatim.
  const searchOrders = (page: number) => {
    if (!networkContext.userNetwork) return;
    const networkId = networkContext.userNetwork.networkId;
    const userId = authContext.sessionInfo?.userId ?? 0;

    switch (networkContext.userNetwork.role) {
      case UserRoleEnum.NetworkManager:
        orderContext.search(networkId, 0, 0, page).then((ret) => {
          if (!ret.sucesso) throwError(ret.mensagemErro);
        });
        break;
      case UserRoleEnum.Seller:
        orderContext.search(networkId, 0, userId, page).then((ret) => {
          if (!ret.sucesso) throwError(ret.mensagemErro);
        });
        break;
      case UserRoleEnum.User:
        orderContext.search(networkId, userId, 0, page).then((ret) => {
          if (!ret.sucesso) throwError(ret.mensagemErro);
        });
        break;
      default:
        // Other roles match the legacy switch's no-op behavior.
        break;
    }
  };

  useEffect(() => {
    if (networkContext.userNetwork) {
      let pageNumInt = parseInt(pageNum ?? "");
      if (!pageNumInt) pageNumInt = 1;
      searchOrders(pageNumInt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Translation helpers ---------------------------------
  const showStatus = (status: OrderStatusEnum): string => {
    switch (status) {
      case OrderStatusEnum.Incoming:
        return t("order_status_incoming");
      case OrderStatusEnum.Active:
        return t("order_status_active");
      case OrderStatusEnum.Suspended:
        return t("order_status_suspended");
      case OrderStatusEnum.Finished:
        return t("order_status_finished");
      case OrderStatusEnum.Expired:
        return t("order_status_expired");
      default:
        return "";
    }
  };

  // BRL-style total. Reuses the legacy "R$ {total}" rendering convention
  // but adds thousands/decimals for readability.
  const formatTotal = (value: number): string => {
    try {
      return new Intl.NumberFormat(i18n.language || "pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value || 0);
    } catch {
      return (value || 0).toFixed(2);
    }
  };

  const formatDate = (iso?: string): string => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "—";
      return new Intl.DateTimeFormat(i18n.language || "pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return "—";
    }
  };

  // ---------------- Local keyword filter --------------------------------
  // The order context's `search` does not accept a free-text term, so we
  // keep keyword filtering client-side over the current page (mirrors the
  // experience of UserSearchPage's input without breaking the legacy API).
  const onSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    // Re-fetch the first page so a freshly typed keyword filters from the top.
    searchOrders(1);
  };

  const matchesKeyword = (order: OrderInfo): boolean => {
    const term = keyword.trim().toLowerCase();
    if (!term) return true;
    const haystack = [
      `#${order.orderId}`,
      order.user?.name ?? "",
      order.user?.email ?? "",
      order.seller?.name ?? "",
      ...(order.items?.map((it) => it.product?.name ?? "") ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  };

  // ---------------- Derived state ---------------------------------------
  const result = orderContext.searchResult;
  const allOrders: OrderInfo[] = result?.orders ?? [];
  const orders = allOrders.filter(matchesKeyword);

  const isLoading = orderContext.loadingSearch;
  const isEmpty = !isLoading && orders.length === 0;

  const currentPage = result?.pageNum ?? 1;
  const totalPages = result?.pageCount ?? 1;
  const showPagination = !isLoading && !!result && totalPages > 1;
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

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
          aria-labelledby="order-search-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="order-search-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("orders")}
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
                  {t("breadcrumb_order_list")}
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Legacy page exposed no primary CTA — keep cluster empty. */}
          </div>
        </section>

        {/* 2. Search + table card --------------------------------------- */}
        <section
          aria-label={t("orders")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {/* Toolbar ---------------------------------------------------- */}
          <form
            onSubmit={onSearchSubmit}
            className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
          >
            <div className="w-full sm:max-w-sm">
              <FormField
                id="order-search-keyword"
                label={t("table_header_product")}
                icon={Search}
              >
                <input
                  id="order-search-keyword"
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t("orderSearchPage.searchPlaceholder")}
                  aria-label={t("orderSearchPage.searchPlaceholder")}
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
                  className="col-span-3 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("orders")}
                </div>
                <div
                  className="col-span-3 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("table_header_buyer")}
                </div>
                <div
                  className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("table_header_product")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("table_header_price")}
                </div>
                <div
                  className="col-span-1 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("table_header_status")}
                </div>
                <div
                  className="col-span-1 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  <span className="sr-only">{t("table_header_actions")}</span>
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
                    <div className="col-span-3 space-y-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2.5 w-28" />
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                    <Skeleton className="col-span-2 h-3 w-3/4" />
                    <Skeleton className="col-span-2 h-3 ml-auto w-20" />
                    <Skeleton className="col-span-1 h-5 ml-auto w-16 rounded-full" />
                    <Skeleton className="col-span-1 h-7 ml-auto w-9" />
                  </div>
                ))}
                {[0, 1, 2].map((idx) => (
                  <div
                    key={`m-${idx}`}
                    className="px-4 py-4 md:hidden space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-1/2" />
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
                  <ShoppingBag size={22} />
                </span>
                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                  {t("orderSearchPage.emptyTitle")}
                </h3>
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                  {t("orderSearchPage.emptyBody")}
                </p>
              </div>
            )}

            {/* Rows -------------------------------------------------- */}
            {!isLoading && !isEmpty && (
              <div role="rowgroup">
                {orders.map((order) => {
                  const labels: OrderSearchRowLabels = {
                    buyerLabel: t("table_header_buyer"),
                    productLabel: t("table_header_product"),
                    totalLabel: t("table_header_price"),
                    lastChangeLabel: t("table_header_last_change"),
                    viewDetails: t("orderSearchPage.viewDetails"),
                    statusText: showStatus(order.status),
                  };
                  return (
                    <OrderSearchRow
                      key={order.orderId}
                      order={order}
                      labels={labels}
                      detailsHref={`/admin/orders/${order.orderId}`}
                      formatTotal={formatTotal}
                      formatDate={formatDate}
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
                onClick={() => searchOrders(currentPage - 1)}
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
                onClick={() => searchOrders(currentPage + 1)}
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
