import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Calendar,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Inbox,
} from "lucide-react";
import StatementListPagedInfo from "../../DTO/Domain/StatementListPagedInfo";
import Moment from "../../Components/MomentShim";

interface IStatementParam {
  loading: boolean;
  StatementResult: StatementListPagedInfo;
  onChangePage: (pageNum: number) => void;
}

/**
 * StatementPart — Tailwind/lucide rewrite of the statement table.
 *
 * Visual contract: `docs/design/dashboard-redesign.html` section 2c.
 * Logic kept identical to the legacy version:
 *   - paged via StatementListPagedInfo (pageNum / pageCount)
 *   - column order: status, paymentDate, networkName, description,
 *     buyerName, sellerName, amount, paidAt
 *
 * Filter chips above the table are visual placeholders for now (the
 * existing context does not expose filter setters). They preserve the
 * UI vocabulary the spec defines so a follow-up wiring step can plug
 * them into `searchStatement` without re-laying out the bar.
 */
export default function StatementPart({
  loading,
  StatementResult,
  onChangePage,
}: IStatementParam) {
  const { t } = useTranslation();

  const [query, setQuery] = useState<string>("");

  const totalRows = StatementResult?.statements?.length ?? 0;

  const renderPageButtons = () => {
    if (!StatementResult) return null;
    const current = StatementResult.pageNum;
    const total = StatementResult.pageCount;

    const pages: Array<number | "ellipsis-prev" | "ellipsis-next"> = [];
    pages.push(1);
    if (current - 2 > 2) pages.push("ellipsis-prev");
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
      pages.push(p);
    }
    if (current + 2 < total - 1) pages.push("ellipsis-next");
    if (total > 1) pages.push(total);

    return pages.map((entry, idx) => {
      if (typeof entry === "string") {
        return (
          <span
            key={`${entry}-${idx}`}
            className="px-2 text-graphite-300"
            aria-hidden="true"
          >
            …
          </span>
        );
      }
      const isActive = entry === current;
      return (
        <button
          key={entry}
          type="button"
          aria-current={isActive ? "page" : undefined}
          aria-label={t("pagination_page_n", { n: entry, defaultValue: `Página ${entry}` })}
          onClick={() => !isActive && onChangePage(entry)}
        >
          {entry}
        </button>
      );
    });
  };

  return (
    <div
      id="dashboard-panel-statement"
      role="tabpanel"
      aria-labelledby="dashboard-tab-statement"
      className="bg-white rounded-2xl border border-graphite-100 shadow-sm overflow-hidden"
    >
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 p-5 border-b border-mnx-neutral-200">
        <label className="mnx-filter-input flex-1 max-w-md">
          <Search size={16} className="text-graphite-400" aria-hidden="true" />
          <input
            type="search"
            placeholder={t("dashboard_search_placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("dashboard_search_placeholder")}
          />
        </label>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="mnx-filter-chip"
            aria-label={t("dashboard_filter_all_periods")}
          >
            <Calendar size={14} aria-hidden="true" />
            {t("dashboard_filter_all_periods")}
            <ChevronDown size={12} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="mnx-filter-chip mnx-filter-chip--active"
            aria-pressed="true"
            aria-label={t("dashboard_filter_status_paid")}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#10B981" }}
              aria-hidden="true"
            />
            {t("dashboard_filter_status_paid")}
            <ChevronDown size={12} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="mnx-filter-chip"
            aria-label={t("dashboard_filter_all_networks")}
          >
            <Globe size={14} aria-hidden="true" />
            {t("dashboard_filter_all_networks")}
            <ChevronDown size={12} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="mnx-stmt-table">
          <caption className="sr-only">
            {t("dashboard_statement_table_caption")}
          </caption>
          <thead>
            <tr>
              <th scope="col" aria-label={t("table_header_status")}>
                ·
              </th>
              <th scope="col">{t("statement_pay_date")}</th>
              <th scope="col">{t("statement_network")}</th>
              <th scope="col">{t("statement_product")}</th>
              <th scope="col">{t("statement_buyer")}</th>
              <th scope="col">{t("statement_seller")}</th>
              <th scope="col" className="is-num">
                {t("statement_amount")}
              </th>
              <th scope="col">{t("statement_paid_at")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8}>
                  <div className="flex justify-center py-10 text-graphite-400">
                    <span className="text-sm">{t("loading")}</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              StatementResult?.statements?.map((statement) => (
                <tr key={`${statement.proxyPayInvoiceId ?? 0}-${statement.feeId}`}>
                  <td>
                    <span
                      className="mnx-status-pill"
                      aria-label={t("invoice_status_paid")}
                    >
                      <DollarSign size={14} aria-hidden="true" />
                    </span>
                  </td>
                  <td>
                    <Moment format="DD/MM/YYYY">{statement.paidAt}</Moment>
                  </td>
                  <td>{statement.networkName}</td>
                  <td>
                    <span className="block font-semibold text-graphite-900">
                      {statement.description}
                    </span>
                  </td>
                  <td>
                    <span className="block font-medium text-graphite-900">
                      {statement.buyerName}
                    </span>
                  </td>
                  <td>
                    <span className="block font-medium text-graphite-900">
                      {statement.sellerName}
                    </span>
                  </td>
                  <td className="is-num">R$ {statement.amount}</td>
                  <td>{statement.paidAt}</td>
                </tr>
              ))}

            {!loading && totalRows === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-12 text-graphite-400 gap-3">
                    <Inbox size={32} aria-hidden="true" />
                    <span className="text-sm">
                      {t("statement_no_statement_found")}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && StatementResult && StatementResult.pageCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t border-mnx-neutral-200">
          <p className="text-xs text-graphite-500" aria-live="polite">
            {t("dashboard_pagination_summary", {
              page: StatementResult.pageNum,
              pageCount: StatementResult.pageCount,
              defaultValue: `Página ${StatementResult.pageNum} de ${StatementResult.pageCount}`,
            })}
          </p>

          <nav className="mnx-pager" aria-label={t("dashboard_pagination_aria")}>
            <button
              type="button"
              disabled={StatementResult.pageNum <= 1}
              onClick={() => onChangePage(StatementResult.pageNum - 1)}
              aria-label={t("pagination_prev")}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>

            {renderPageButtons()}

            <button
              type="button"
              disabled={StatementResult.pageNum >= StatementResult.pageCount}
              onClick={() => onChangePage(StatementResult.pageNum + 1)}
              aria-label={t("pagination_next")}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
