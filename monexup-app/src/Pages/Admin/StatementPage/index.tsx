import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
  RotateCcw,
  Check,
  ReceiptText,
} from "lucide-react";

import NetworkContext from "../../../Contexts/Network/NetworkContext";
import InvoiceContext from "../../../Contexts/Invoice/InvoiceContext";
import { UserRoleEnum } from "../../../DTO/Enum/UserRoleEnum";
import { MessageToastEnum } from "../../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../../Components/MessageToast";
import { Skeleton } from "../../../Components/ui/skeleton";
import Moment from "../../../Components/MomentShim";
import StatementInfo from "../../../DTO/Domain/StatementInfo";
import StatementSearchParam from "../../../DTO/Domain/StatementSearchParam";
import StatusChip, { StatementStatus } from "./StatusChip";

/**
 * StatementPage — full-page "Extrato" admin route (`/admin/statement`).
 *
 * Visual contract: `specs/011-commission-ledger/design/statement-mockup.html`
 * (+ `statement-tokens.md` / `statement-component-spec.md`). Editorial-brutalist
 * light admin surface, rendered inside `LayoutAdmin` (no page chrome of its
 * own — sidebar/header come from the layout), mirroring `ProductSearchPage`.
 *
 * Data flow:
 *   - statement rows from `invoiceContext.searchStatement`, scoped to the
 *     active network (backend derives identity from the session).
 *   - balance strip from `getMyBalance` (Seller) / `getNetworkBalance`
 *     (NetworkManager) — both return { total, released, maturing }.
 *   - status/reversed come straight from the backend `StatementInfo` — never
 *     re-derived from `amount < 0`.
 */

const PAGE_SIZE = 15;

/** Backend is the single source of truth for the row status. */
function resolveStatus(item: StatementInfo): StatementStatus {
  if (item.reversed || item.status === "reversed") return "reversed";
  if (item.status === "maturing") return "maturing";
  return "released";
}

export default function StatementPage() {
  const { t } = useTranslation();

  const networkContext = useContext(NetworkContext);
  const invoiceContext = useContext(InvoiceContext);

  const [pageNum, setPageNum] = useState<number>(1);

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  const throwError = (message: string) => {
    setDialog(MessageToastEnum.Error);
    setMessageText(message);
    setShowMessage(true);
  };

  const currentRole = networkContext?.currentRole;
  const isNetworkManager = currentRole === UserRoleEnum.NetworkManager;
  const isAuthorized =
    currentRole === UserRoleEnum.Seller ||
    currentRole === UserRoleEnum.NetworkManager ||
    currentRole === UserRoleEnum.Administrator;

  const activeNetworkId = networkContext?.userNetwork?.networkId;

  // Role-aware balance: NetworkManager → network own-cut; otherwise member.
  const balance = isNetworkManager
    ? invoiceContext?.networkBalance
    : invoiceContext?.memberBalance;
  const loadingBalance = isNetworkManager
    ? invoiceContext?.loadingNetworkBalance
    : invoiceContext?.loadingMemberBalance;

  // ---- Statement fetch (scoped to the active network) --------------------
  useEffect(() => {
    if (!isAuthorized || !activeNetworkId) return;
    const param: StatementSearchParam = { networkId: activeNetworkId, pageNum };
    invoiceContext.searchStatement(param).then((ret) => {
      if (!ret.sucesso) throwError(ret.mensagemErro);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNetworkId, pageNum, isAuthorized]);

  // ---- Balance strip fetch ----------------------------------------------
  useEffect(() => {
    if (!isAuthorized || !activeNetworkId) return;
    const fetchBalance = isNetworkManager
      ? invoiceContext.getNetworkBalance(activeNetworkId)
      : invoiceContext.getMyBalance(activeNetworkId);
    fetchBalance.then((ret) => {
      if (!ret.sucesso) throwError(ret.mensagemErro);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNetworkId, isNetworkManager, isAuthorized]);

  // ---- Derived state -----------------------------------------------------
  const result = invoiceContext?.statementResult;
  const loading = Boolean(invoiceContext?.loadingSearch);
  const rows: StatementInfo[] = result?.statements ?? [];
  const isEmpty = !loading && rows.length === 0;
  const currentPage = result?.pageNum ?? 1;
  const totalPages = result?.pageCount ?? 1;
  const showPagination = !loading && !!result && totalPages > 1;
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const statusLabels = {
    released: t("statementPage.status.released", "Liberado"),
    maturing: t("statementPage.status.maturing", "Maturando"),
    reversed: t("statementPage.status.reversed", "Estornado"),
  };
  const reversedNote = t("statementPage.reversedNote", "Pagamento estornado");
  const currency = t("statementPage.currency", "R$");

  const formatAmount = (item: StatementInfo, status: StatementStatus): string =>
    status === "reversed"
      ? `− ${currency} ${Math.abs(item.amount)}`
      : `${currency} ${item.amount}`;

  const originSub = (item: StatementInfo, status: StatementStatus): string => {
    const base = [item.networkName, item.buyerName].filter(Boolean).join(" · ");
    return status === "reversed" ? `${base} · ${reversedNote}` : base;
  };

  if (!isAuthorized) {
    return (
      <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
        <div className="max-w-container mx-auto px-shell pt-6 pb-12">
          <p className="text-sm text-graphite-700">
            {t(
              "statementPage.notAuthorized",
              "Você precisa ser vendedor da rede para acessar o extrato."
            )}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={dialog}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />

      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band ------------------------------------------- */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="statement-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="statement-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("statementPage.title", "Extrato")}
              </h1>
            </div>
            <nav aria-label="Breadcrumb" className="mt-2 ml-[14px] text-sm">
              <ol className="flex items-center gap-1 text-graphite-500">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-orange-600 transition-colors duration-fast"
                  >
                    {t("footer_dashboard")}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-graphite-300">
                  <ChevronRight size={14} />
                </li>
                <li
                  aria-current="page"
                  className="font-medium text-graphite-700 truncate max-w-[14rem]"
                >
                  {t("statementPage.title", "Extrato")}
                </li>
              </ol>
            </nav>
          </div>
        </section>

        {/* 2. Balance summary strip -------------------------------------- */}
        <section
          className="grid grid-cols-3 gap-4 mb-6 animate-fade-up"
          aria-label={t("statementPage.balanceStripAria", "Resumo de saldo")}
        >
          {/* Focal dark tile — Saldo total */}
          <article className="mnx-surface-dark relative rounded-2xl overflow-hidden bg-mesh-balance p-5 text-mnx-neutral-50">
            <div
              className="balance-grid absolute inset-0 pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="text-xs uppercase tracking-wider font-semibold text-graphite-300">
                {t("statementPage.balance.total", "Saldo total")}
              </p>
              <p className="mnx-num mt-2 flex items-baseline gap-1.5">
                <span className="text-sm text-graphite-300">{currency}</span>
                <span className="text-4xl font-bold text-mnx-neutral-50">
                  {loadingBalance ? (
                    <Skeleton className="inline-block h-8 w-32 align-middle" />
                  ) : (
                    balance?.total ?? 0
                  )}
                </span>
              </p>
            </div>
          </article>

          {/* Liberado para saque */}
          <div className="rounded-xl border border-mnx-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span
                className="mnx-stat-chip mnx-stat-chip--green"
                aria-hidden="true"
              >
                <Check size={20} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-graphite-500">
                  {t("statementPage.balance.released", "Liberado para saque")}
                </p>
                <p className="mnx-num mt-1 flex items-baseline gap-1.5">
                  <span className="text-sm text-graphite-400">{currency}</span>
                  <span className="text-2xl font-bold text-graphite-900">
                    {loadingBalance ? (
                      <Skeleton className="inline-block h-6 w-24 align-middle" />
                    ) : (
                      balance?.released ?? 0
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Ainda maturando */}
          <div className="rounded-xl border border-mnx-neutral-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span
                className="mnx-stat-chip mnx-stat-chip--orange"
                aria-hidden="true"
              >
                <Clock size={20} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-graphite-500">
                  {t("statementPage.balance.maturing", "Ainda maturando")}
                </p>
                <p className="mnx-num mt-1 flex items-baseline gap-1.5">
                  <span className="text-sm text-graphite-400">{currency}</span>
                  <span className="text-2xl font-bold text-graphite-900">
                    {loadingBalance ? (
                      <Skeleton className="inline-block h-6 w-24 align-middle" />
                    ) : (
                      balance?.maturing ?? 0
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Statement card --------------------------------------------- */}
        <section
          aria-label={t("statementPage.title", "Extrato")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
            {/* Loading skeleton ------------------------------------------ */}
            {loading && (
              <div className="divide-y divide-mnx-neutral-100" aria-busy="true">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="px-4 h-16 grid grid-cols-[2rem_6rem_1fr_8rem_6rem] items-center gap-4"
                  >
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-3 w-20 ml-auto" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state ----------------------------------------------- */}
            {isEmpty && (
              <div className="px-6 py-14 text-center">
                <span
                  className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
                  aria-hidden="true"
                >
                  <ReceiptText size={22} />
                </span>
                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                  {t(
                    "statementPage.emptyTitle",
                    "Nenhuma comissão recebida ainda"
                  )}
                </h3>
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                  {t(
                    "statementPage.emptyBody",
                    "Quando suas redes gerarem vendas, cada comissão aparecerá aqui com data, origem e status de maturação."
                  )}
                </p>
              </div>
            )}

            {/* Populated ------------------------------------------------- */}
            {!loading && !isEmpty && (
              <>
                {/* Desktop table --------------------------------------- */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="mnx-stmt-table">
                    <caption className="sr-only">
                      {t(
                        "statementPage.tableCaption",
                        "Extrato de comissões recebidas, uma linha por comissão."
                      )}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col" aria-label={t("statementPage.columns.indicator", "Indicador")}>
                          ·
                        </th>
                        <th scope="col">{t("statementPage.columns.date", "Data")}</th>
                        <th scope="col">{t("statementPage.columns.origin", "Origem")}</th>
                        <th scope="col">{t("statementPage.columns.status", "Status")}</th>
                        <th scope="col" className="is-num">
                          {t("statementPage.columns.amount", "Valor")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((item, idx) => {
                        const status = resolveStatus(item);
                        const isReversed = status === "reversed";
                        return (
                          <tr key={`${item.proxyPayInvoiceId ?? 0}-${item.feeId}-${idx}`}>
                            <td>
                              <span
                                className="mnx-status-pill"
                                aria-hidden="true"
                                style={
                                  status === "maturing"
                                    ? { background: "#FFFBEB", color: "#B45309" }
                                    : status === "reversed"
                                    ? { background: "rgba(244,63,94,0.10)", color: "#BE123C" }
                                    : undefined
                                }
                              >
                                {status === "released" && <DollarSign size={14} />}
                                {status === "maturing" && <Clock size={14} />}
                                {status === "reversed" && <RotateCcw size={14} />}
                              </span>
                            </td>
                            <td className="mnx-num">
                              <Moment format="DD/MM/YYYY">{item.paidAt}</Moment>
                            </td>
                            <td>
                              <span
                                className={`block font-semibold ${
                                  isReversed
                                    ? "text-graphite-500 line-through"
                                    : "text-graphite-900"
                                }`}
                              >
                                {item.description}
                              </span>
                              <span className="block text-xs text-graphite-500">
                                {originSub(item, status)}
                              </span>
                            </td>
                            <td>
                              <StatusChip status={status} labels={statusLabels} />
                            </td>
                            <td
                              className="is-num mnx-num"
                              style={isReversed ? { color: "#BE123C" } : undefined}
                            >
                              {formatAmount(item, status)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile stacked cards -------------------------------- */}
                <div className="md:hidden divide-y divide-mnx-neutral-100">
                  {rows.map((item, idx) => {
                    const status = resolveStatus(item);
                    const isReversed = status === "reversed";
                    return (
                      <div
                        key={`m-${item.proxyPayInvoiceId ?? 0}-${item.feeId}-${idx}`}
                        className="p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span
                              className={`block font-semibold ${
                                isReversed
                                  ? "text-graphite-500 line-through"
                                  : "text-graphite-900"
                              }`}
                            >
                              {item.description}
                            </span>
                            <span className="block text-xs text-graphite-500">
                              {originSub(item, status)}
                            </span>
                          </div>
                          <span
                            className="mnx-num font-bold whitespace-nowrap"
                            style={isReversed ? { color: "#BE123C" } : undefined}
                          >
                            {formatAmount(item, status)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <StatusChip status={status} labels={statusLabels} />
                          <span className="text-xs text-graphite-500">
                            <Moment format="DD/MM/YYYY">{item.paidAt}</Moment>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Pagination (admin-list control, page size 15) ------------- */}
          {showPagination && (
            <nav
              aria-label="Pagination"
              className="mt-4 flex items-center justify-between gap-3"
            >
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                className="inline-flex h-9 items-center gap-1 px-3 rounded-md text-sm font-medium text-graphite-700 hover:bg-mnx-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>{t("userSearchPage.actions.previous")}</span>
              </button>

              <span
                className="text-xs text-graphite-500 mnx-num tabular-nums"
                aria-live="polite"
              >
                {t("userSearchPage.pageOf", {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>

              <button
                type="button"
                onClick={() => setPageNum((p) => p + 1)}
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
