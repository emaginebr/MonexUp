import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react";

import AuthContext from "../../Contexts/Auth/AuthContext";
import BillingContext from "../../Contexts/Billing/BillingContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import InvoiceListItemInfo from "../../DTO/Domain/InvoiceListItemInfo";
import FormField from "../NetworkEditPage/FormField";

import BillingSearchRow, { BillingSearchRowVariant } from "./BillingSearchRow";

/**
 * BillingManagePage — redesigned `/admin/billing`.
 * Role-aware invoices list. Backend joins buyer/seller so a single search
 * call powers both the manager (7-col) and seller (6-col) column layouts.
 */

const PAGE_SIZE = 20;

type StatusFilter = number | null;

interface FilterChip {
  key: string;
  label: string;
  value: StatusFilter;
}

export default function BillingManagePage() {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);
  const billingContext = useContext(BillingContext);

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);

  const [invoices, setInvoices] = useState<InvoiceListItemInfo[]>([]);
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasEverLoaded, setHasEverLoaded] = useState<boolean>(false);

  const network = networkContext?.network;
  const session = authContext?.sessionInfo;
  const currentRole = networkContext?.currentRole ?? UserRoleEnum.NoRole;

  const throwError = (message: string) => {
    setDialog(MessageToastEnum.Error);
    setMessageText(message);
    setShowMessage(true);
  };

  // ---------------- Role → column variant -------------------------------
  const variant: BillingSearchRowVariant | null = useMemo(() => {
    switch (currentRole) {
      case UserRoleEnum.NetworkManager:
      case UserRoleEnum.Administrator:
        return "manager";
      case UserRoleEnum.Seller:
      case UserRoleEnum.User:
        return "seller";
      default:
        return null;
    }
  }, [currentRole]);

  // ---------------- Debounce keyword -----------------------------------
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  // ---------------- Fetch ----------------------------------------------
  const fetchInvoices = async (page: number) => {
    if (!network?.networkId || !variant) return;
    setIsLoading(true);
    const ret = await billingContext.searchInvoices({
      networkId: network.networkId,
      pageNum: page,
      pageSize: PAGE_SIZE,
      keyword: debouncedKeyword || undefined,
      status: statusFilter,
    });
    setIsLoading(false);
    setHasEverLoaded(true);
    if (ret.sucesso) {
      setInvoices((ret.invoices as InvoiceListItemInfo[]) || []);
      setPageNum(ret.pageNum || 1);
      setPageCount(ret.pageCount || 1);
    } else if (ret.mensagemErro) {
      throwError(ret.mensagemErro);
    }
  };

  // Refetch on network / role / filter / keyword change. Always resets to page 1.
  useEffect(() => {
    if (!network?.networkId || !session || !variant) return;
    fetchInvoices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network?.networkId, variant, debouncedKeyword, statusFilter]);

  // ---------------- Filter chips ----------------------------------------
  const filterChips: FilterChip[] = useMemo(
    () => [
      { key: "all",       label: t("billingPage.filter_all", "Todas"),           value: null },
      { key: "paid",      label: t("billingPage.filter_paid", "Pagas"),          value: 3 },
      { key: "pending",   label: t("billingPage.filter_pending", "Pendentes"),   value: 1 },
      { key: "sent",      label: t("billingPage.filter_sent", "Enviadas"),       value: 2 },
      { key: "overdue",   label: t("billingPage.filter_overdue", "Vencidas"),    value: 4 },
      { key: "canceled",  label: t("billingPage.filter_canceled", "Canceladas"), value: 5 },
      { key: "expired",   label: t("billingPage.filter_expired", "Expiradas"),   value: 6 },
    ],
    [t]
  );

  const canPrev = pageNum > 1;
  const canNext = pageNum < pageCount;
  const showPagination = !isLoading && pageCount > 1;

  const isEmpty = !isLoading && invoices.length === 0;
  const isFilterActive = !!debouncedKeyword || statusFilter !== null;

  // ---------------- Not authorized fallback ----------------------------
  if (variant === null) {
    return (
      <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
        <div className="max-w-container mx-auto px-shell pt-6 pb-12">
          <section className="auth-card relative p-6 sm:p-8 text-center animate-fade-up">
            <span
              className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
              aria-hidden="true"
            >
              <FileText size={22} />
            </span>
            <h1 className="mt-4 display-headline text-graphite-900 text-xl sm:text-2xl">
              {t("billingPage.title", "Cobranças")}
            </h1>
            <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
              {t(
                "billingPage.not_authorized",
                "Você não tem permissão para ver as cobranças desta rede."
              )}
            </p>
          </section>
        </div>
      </main>
    );
  }

  const labels = {
    buyerLabel: t("billingPage.col_buyer", "Comprador"),
    sellerLabel: t("billingPage.col_seller", "Vendedor"),
    dueDateLabel: t("billingPage.col_dueDate", "Vencimento"),
    amountLabel: t("billingPage.col_amount", "Valor"),
    viewDetails: t("billingPage.viewDetails", "Ver detalhes"),
  };

  const numColHeaderCls =
    (variant === "manager" ? "col-span-2" : "col-span-3") +
    " text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500";
  const buyerColHeaderCls =
    (variant === "manager" ? "col-span-3" : "col-span-4") +
    " text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500";

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
          aria-labelledby="billing-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="billing-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("billingPage.title", "Cobranças")}
              </h1>
            </div>
            <nav aria-label="Breadcrumb" className="mt-2 ml-[14px] text-sm">
              <ol className="flex items-center gap-1 text-graphite-500">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-orange-600 transition-colors duration-fast"
                  >
                    {t("profileListPage.myNetwork", "Minha Rede")}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-graphite-300">
                  <ChevronRight size={14} />
                </li>
                <li
                  aria-current="page"
                  className="font-medium text-graphite-700 truncate max-w-[14rem]"
                >
                  {t("billingPage.breadcrumb", "Cobranças")}
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Invoices are auto-created by the checkout / ProxyPay pipeline. */}
          </div>
        </section>

        {/* 2. Toolbar + table card -------------------------------------- */}
        <section
          aria-label={t("billingPage.title", "Cobranças")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {/* Toolbar --------------------------------------------------- */}
          <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            {/* Keyword search */}
            <div className="w-full md:max-w-sm">
              <FormField
                id="billing-search-keyword"
                label={t("billingPage.col_buyer", "Comprador")}
                icon={Search}
              >
                <input
                  id="billing-search-keyword"
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t(
                    "billingPage.searchPlaceholder",
                    "Buscar por número, comprador ou vendedor"
                  )}
                  aria-label={t(
                    "billingPage.searchPlaceholder",
                    "Buscar por número, comprador ou vendedor"
                  )}
                  className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 placeholder:text-graphite-400 focus:outline-none pr-3"
                />
              </FormField>
            </div>

            {/* Status filter chips */}
            <div
              className="flex items-center gap-1.5 flex-wrap"
              role="group"
              aria-label={t("billingPage.filter_srLabel", "Filtro por status")}
            >
              {filterChips.map((chip) => {
                const active = chip.value === statusFilter;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setStatusFilter(chip.value)}
                    aria-pressed={active}
                    className={
                      "h-8 px-3 rounded-full text-xs font-semibold ring-1 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 " +
                      (active
                        ? "bg-orange-500 text-white ring-orange-500"
                        : "bg-mnx-neutral-50 text-graphite-700 ring-mnx-neutral-200 hover:border-graphite-400")
                    }
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table ------------------------------------------------------ */}
          <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
            {/* Desktop column header — hidden only on full empty state
                (no rows AND no filter). Kept visible on filter-miss so
                users see WHERE the miss is. */}
            {!(isEmpty && !isFilterActive && !isLoading) && (
              <div
                className="hidden md:!grid grid-cols-12 gap-4 px-4 h-11 items-center bg-mnx-neutral-50 border-b border-mnx-neutral-200"
                role="row"
              >
                <div className={numColHeaderCls} role="columnheader">
                  {t("billingPage.col_invoiceNumber", "Nº fatura")}
                </div>
                <div className={buyerColHeaderCls} role="columnheader">
                  {t("billingPage.col_buyer", "Comprador")}
                </div>
                {variant === "manager" && (
                  <div
                    className="col-span-2 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                    role="columnheader"
                  >
                    {t("billingPage.col_seller", "Vendedor")}
                  </div>
                )}
                <div
                  className="col-span-1 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("billingPage.col_dueDate", "Vencimento")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("billingPage.col_amount", "Valor")}
                </div>
                <div
                  className="col-span-1 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("billingPage.col_status", "Status")}
                </div>
                <div
                  className="col-span-1 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  <span className="sr-only">
                    {t("billingPage.col_actions", "Ações")}
                  </span>
                </div>
              </div>
            )}

            {/* Loading skeleton --------------------------------------- */}
            {isLoading && (
              <div className="divide-y divide-mnx-neutral-100" aria-busy="true">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="px-4 h-14 hidden md:!grid grid-cols-12 items-center gap-4"
                  >
                    <div className={`${variant === "manager" ? "col-span-2" : "col-span-3"}`}>
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className={`${variant === "manager" ? "col-span-3" : "col-span-4"} space-y-1.5`}>
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                    {variant === "manager" && (
                      <Skeleton className="col-span-2 h-3 w-3/4" />
                    )}
                    <Skeleton className="col-span-1 h-3 w-20" />
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
                      <Skeleton className="h-4 w-32" />
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

            {/* Empty state — no invoices at all (no filter active) --- */}
            {!isLoading && isEmpty && !isFilterActive && hasEverLoaded && (
              <div className="px-6 py-14 text-center">
                <span
                  className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
                  aria-hidden="true"
                >
                  <FileText size={22} />
                </span>
                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                  {t("billingPage.emptyTitle", "Nenhuma cobrança emitida")}
                </h3>
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                  {t(
                    "billingPage.emptyBody",
                    "Assim que uma fatura for gerada pelo checkout ou pela ProxyPay para essa rede, ela aparecerá aqui com status, vencimento e valor."
                  )}
                </p>
              </div>
            )}

            {/* Filter-miss empty (there ARE invoices, just none match) */}
            {!isLoading && isEmpty && isFilterActive && (
              <div className="px-6 py-10 text-center text-sm text-graphite-500">
                {t(
                  "billingPage.emptyFilterHint",
                  "Nenhuma fatura corresponde ao filtro. Tente outro termo ou volte para Todas."
                )}
              </div>
            )}

            {/* Rows -------------------------------------------------- */}
            {!isLoading && invoices.length > 0 && (
              <div role="rowgroup">
                {invoices.map((invoice) => (
                  <BillingSearchRow
                    key={invoice.invoiceId}
                    invoice={invoice}
                    variant={variant}
                    labels={labels}
                    detailsHref={`/admin/orders/${invoice.orderId}/invoices/${invoice.invoiceId}`}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination ------------------------------------------------ */}
          {showPagination && (
            <nav
              aria-label="Pagination"
              className="mt-4 flex items-center justify-between gap-3"
            >
              <button
                type="button"
                onClick={() => fetchInvoices(pageNum - 1)}
                disabled={!canPrev}
                className="inline-flex h-9 items-center gap-1 px-3 rounded-md text-sm font-medium text-graphite-700 hover:bg-mnx-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>{t("userSearchPage.actions.previous", "Anterior")}</span>
              </button>

              <span className="text-xs text-graphite-500 mnx-num tabular-nums">
                {t("userSearchPage.pageOf", "Página {{current}} de {{total}}", {
                  current: pageNum,
                  total: pageCount,
                })}
              </span>

              <button
                type="button"
                onClick={() => fetchInvoices(pageNum + 1)}
                disabled={!canNext}
                className="inline-flex h-9 items-center gap-1 px-3 rounded-md text-sm font-medium text-graphite-700 hover:bg-mnx-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span>{t("userSearchPage.actions.next", "Próxima")}</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
