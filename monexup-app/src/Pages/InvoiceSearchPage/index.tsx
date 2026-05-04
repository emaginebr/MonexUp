import { useContext, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Receipt,
  RefreshCw,
  Search,
} from "lucide-react";

import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import InvoiceContext from "../../Contexts/Invoice/InvoiceContext";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { InvoiceStatusEnum } from "../../DTO/Enum/InvoiceStatusEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import InvoiceInfo from "../../DTO/Domain/InvoiceInfo";
import FormField from "../NetworkEditPage/FormField";

import InvoiceSearchRow, {
  InvoiceSearchRowLabels,
} from "./InvoiceSearchRow";

/**
 * InvoiceSearchPage — redesigned `/admin/invoices` route.
 *
 * Visual contract: matches the editorial-brutalist light surface used by
 * ProfileListPage / OrderSearchPage / UserSearchPage. Rendered inside
 * `LayoutAdmin`, so this component does not render any header chrome.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - reads `invoiceContext.searchResult` and `invoiceContext.loadingSearch`
 *   - calls `invoiceContext.search(networkId, userId, sellerId, pageNum)`
 *     with the same role-gated argument tuple
 *     (NetworkManager → search by network only,
 *      Seller          → filter by sellerId = sessionInfo.userId,
 *      User            → filter by userId   = sessionInfo.userId)
 *   - keeps the per-page `:pageNum` URL parameter
 *   - shows error feedback through `MessageToast`
 *   - product name join + total computation match `showProducts` / `showTotal`
 *     (delegated to InvoiceSearchRow's helpers)
 *   - status text reuses the existing `invoice_status_*` keys
 *   - the legacy "Syncronize" CTA is preserved as a secondary action in
 *     the page header right-cluster, calling `invoiceContext.syncronize()`
 *     and re-fetching page 1 on success — same as the legacy onClick.
 *   - the legacy per-row "Suspend" link routed back to `/admin/orders` as
 *     a placeholder, so this redesign replaces it with a single Eye action
 *     that links to the same target until a per-invoice detail route exists.
 */
export default function InvoiceSearchPage() {
  const { t, i18n } = useTranslation();

  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);
  const invoiceContext = useContext(InvoiceContext);

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
  const searchInvoices = (page: number) => {
    if (!networkContext.userNetwork) return;
    const networkId = networkContext.userNetwork.networkId;
    const userId = authContext.sessionInfo?.userId ?? 0;

    switch (networkContext.currentRole) {
      case UserRoleEnum.NetworkManager:
        invoiceContext.search(networkId, 0, 0, page).then((ret) => {
          if (!ret.sucesso) throwError(ret.mensagemErro);
        });
        break;
      case UserRoleEnum.Seller:
        invoiceContext.search(networkId, 0, userId, page).then((ret) => {
          if (!ret.sucesso) throwError(ret.mensagemErro);
        });
        break;
      case UserRoleEnum.User:
        invoiceContext.search(networkId, userId, 0, page).then((ret) => {
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
      searchInvoices(pageNumInt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preserve the legacy "Syncronize" CTA verbatim.
  const handleSync = async () => {
    const ret = await invoiceContext.syncronize();
    if (!ret.sucesso) {
      throwError(ret.mensagemErro);
      return;
    }
    searchInvoices(1);
  };

  // ---------------- Translation helpers ---------------------------------
  const showStatus = (status: InvoiceStatusEnum): string => {
    switch (status) {
      case InvoiceStatusEnum.Draft:
        return t("invoice_status_draft");
      case InvoiceStatusEnum.Open:
        return t("invoice_status_open");
      case InvoiceStatusEnum.Paid:
        return t("invoice_status_paid");
      case InvoiceStatusEnum.Cancelled:
        return t("invoice_status_cancelled");
      case InvoiceStatusEnum.Lost:
        return t("invoice_status_lost");
      default:
        return "";
    }
  };

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
      }).format(d);
    } catch {
      return "—";
    }
  };

  // ---------------- Local keyword filter --------------------------------
  // The invoice context's `search` does not accept a free-text term, so we
  // keep keyword filtering client-side over the current page (mirrors the
  // experience of OrderSearchPage's input without breaking the legacy API).
  const onSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    // Re-fetch the first page so a freshly typed keyword filters from the top.
    searchInvoices(1);
  };

  const matchesKeyword = (invoice: InvoiceInfo): boolean => {
    const term = keyword.trim().toLowerCase();
    if (!term) return true;
    const haystack = [
      `#${invoice.invoiceId}`,
      invoice.user?.name ?? "",
      invoice.user?.email ?? "",
      invoice.seller?.name ?? "",
      ...(invoice.order?.items?.map((it) => it.product?.name ?? "") ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  };

  // ---------------- Derived state ---------------------------------------
  const result = invoiceContext.searchResult;
  const allInvoices: InvoiceInfo[] = result?.invoices ?? [];
  const invoices = allInvoices.filter(matchesKeyword);

  const isLoading = invoiceContext.loadingSearch;
  const isEmpty = !isLoading && invoices.length === 0;

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
          aria-labelledby="invoice-search-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="invoice-search-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("invoices")}
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
                  {t("invoices")}
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Legacy preserved: Syncronize CTA */}
            <button
              type="button"
              onClick={handleSync}
              disabled={invoiceContext.loadingUpdate}
              className="inline-flex h-9 items-center gap-2 px-4 rounded-md border border-mnx-neutral-200 bg-white text-graphite-700 hover:bg-mnx-neutral-100 hover:text-graphite-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label={t("invoiceSearchPage.synchronize")}
              title={t("invoiceSearchPage.synchronize")}
            >
              <RefreshCw
                size={16}
                aria-hidden="true"
                className={
                  invoiceContext.loadingUpdate ? "animate-spin" : undefined
                }
              />
              <span className="hidden sm:inline">
                {invoiceContext.loadingUpdate
                  ? t("loading")
                  : t("invoiceSearchPage.synchronize")}
              </span>
            </button>
          </div>
        </section>

        {/* 2. Search + table card --------------------------------------- */}
        <section
          aria-label={t("invoices")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {/* Toolbar ---------------------------------------------------- */}
          <form
            onSubmit={onSearchSubmit}
            className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
          >
            <div className="w-full sm:max-w-sm">
              <FormField
                id="invoice-search-keyword"
                label={t("table_header_product")}
                icon={Search}
              >
                <input
                  id="invoice-search-keyword"
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t("invoiceSearchPage.searchPlaceholder")}
                  aria-label={t("invoiceSearchPage.searchPlaceholder")}
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
                  {t("invoices")}
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
                  <Receipt size={22} />
                </span>
                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                  {t("invoiceSearchPage.emptyTitle")}
                </h3>
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                  {t("invoiceSearchPage.emptyBody")}
                </p>
              </div>
            )}

            {/* Rows -------------------------------------------------- */}
            {!isLoading && !isEmpty && (
              <div role="rowgroup">
                {invoices.map((invoice) => {
                  const labels: InvoiceSearchRowLabels = {
                    buyerLabel: t("table_header_buyer"),
                    sellerLabel: t("table_header_seller"),
                    productLabel: t("table_header_product"),
                    totalLabel: t("table_header_price"),
                    dueDateLabel: t("table_header_due_date"),
                    paidDateLabel: t("table_header_paid_date"),
                    viewDetails: t("invoiceSearchPage.viewDetails"),
                    statusText: showStatus(invoice.status),
                  };
                  return (
                    <InvoiceSearchRow
                      key={invoice.invoiceId}
                      invoice={invoice}
                      labels={labels}
                      detailsHref="/admin/orders"
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
                onClick={() => searchInvoices(currentPage - 1)}
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
                onClick={() => searchInvoices(currentPage + 1)}
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
