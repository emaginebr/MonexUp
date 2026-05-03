import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  Users,
  Receipt,
  Filter,
  Download,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import InvoiceContext from "../../Contexts/Invoice/InvoiceContext";
import { UserRoleEnum } from "../../DTO/Enum/UserRoleEnum";
import StatementSearchParam from "../../DTO/Domain/StatementSearchParam";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import StatementPart from "./StatementPart";
import KpiCard from "./KpiCard";
import BalanceCard from "./BalanceCard";

type DashboardTabKey = "statement" | "orders";

/**
 * DashboardPage — redesigned admin dashboard.
 *
 * Visual contract: `docs/design/dashboard-redesign.html` and the
 * per-component spec at `docs/design/dashboard-spec.md`. This rewrite
 * preserves 100% of the legacy data flow:
 *   - role-based fetching (`searchStatements`, `getBalance`,
 *     `getAvailableBalance`)
 *   - role gating via `UserRoleEnum`
 *   - statement pagination via `StatementListPagedInfo`
 *   - error surface through `MessageToast`
 * Bootstrap chrome and FontAwesome icons were dropped in favor of the
 * shared Tailwind/lucide vocabulary used by Home and `/new-seller`.
 */
export default function DashboardPage() {
  const { t, i18n } = useTranslation();

  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);
  const invoiceContext = useContext(InvoiceContext);

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<DashboardTabKey>("statement");

  const throwError = (message: string) => {
    setDialog(MessageToastEnum.Error);
    setMessageText(message);
    setShowMessage(true);
  };

  const searchStatements = async (pageNum: number) => {
    let param: StatementSearchParam;
    switch (networkContext.currentRole) {
      case UserRoleEnum.NetworkManager:
        param = {
          ...param,
          networkId: networkContext.userNetwork.networkId,
          pageNum: pageNum,
        };
        break;
      case UserRoleEnum.Seller:
        param = {
          ...param,
          userId: authContext.sessionInfo.userId,
          pageNum: pageNum,
        };
        break;
    }
    if (networkContext.currentRole !== UserRoleEnum.User) {
      const ret = await invoiceContext.searchStatement(param);
      if (!ret.sucesso) {
        throwError(ret.mensagemErro);
      }
    }
  };

  useEffect(() => {
    searchStatements(1);
    switch (networkContext.currentRole) {
      case UserRoleEnum.NetworkManager:
        invoiceContext
          .getBalance(networkContext.userNetwork.networkId)
          .then((ret) => {
            if (!ret.sucesso) {
              throwError(ret.mensagemErro);
            }
          });
        break;
      case UserRoleEnum.Seller:
        invoiceContext.getBalance().then((ret) => {
          if (!ret.sucesso) {
            throwError(ret.mensagemErro);
          }
        });
        invoiceContext.getAvailableBalance().then((ret) => {
          if (!ret.sucesso) {
            throwError(ret.mensagemErro);
          }
        });
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isUserOnly = networkContext.currentRole === UserRoleEnum.User;
  const isSeller = networkContext.currentRole === UserRoleEnum.Seller;
  const isNetworkManager =
    networkContext.currentRole === UserRoleEnum.NetworkManager;

  const firstName =
    authContext.sessionInfo?.name?.split(" ")[0] ??
    t("dashboard_default_user");

  const todayLabel = (() => {
    try {
      const lang = i18n.language?.split("-")[0] ?? "pt";
      const localeMap: Record<string, string> = {
        pt: "pt-BR",
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
      };
      return new Date().toLocaleDateString(localeMap[lang] ?? "pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  })();

  const roleLabel = isNetworkManager
    ? t("network_manager")
    : isSeller
    ? t("seller")
    : t("user");

  const networkName =
    isNetworkManager && networkContext.userNetwork?.network?.name
      ? networkContext.userNetwork.network.name
      : undefined;

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={dialog}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />

      <div className="max-w-container mx-auto px-shell pt-10 pb-16">
        {/* 1. Page header band ------------------------------------------- */}
        <section
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 animate-fade-up"
          aria-labelledby="dashboard-page-title"
        >
          <div>
            <span className="mnx-eyebrow">{t("dashboard_eyebrow")}</span>
            <h1
              id="dashboard-page-title"
              className="display-headline mt-3 text-graphite-900 text-4xl sm:text-5xl"
            >
              {t("dashboard_greeting")}, {firstName}.
            </h1>
            <p className="mt-3 text-graphite-500 text-base sm:text-lg max-w-xl leading-relaxed">
              {todayLabel}
              {!isUserOnly && (
                <>
                  <span aria-hidden="true" className="px-2 text-graphite-300">
                    ·
                  </span>
                  <span className="font-medium text-graphite-700">
                    {roleLabel}
                  </span>
                </>
              )}
              {networkName && (
                <>
                  <span aria-hidden="true" className="px-2 text-graphite-300">
                    ·
                  </span>
                  {networkName}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex w-10 h-10 items-center justify-center rounded-md border border-mnx-neutral-300 text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
              aria-label={t("dashboard_filter")}
            >
              <Filter size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex w-10 h-10 items-center justify-center rounded-md border border-mnx-neutral-300 text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
              aria-label={t("dashboard_export")}
            >
              <Download size={18} aria-hidden="true" />
            </button>
            {!isUserOnly && (
              <button
                type="button"
                disabled
                className="inline-flex h-10 items-center px-4 rounded-md text-sm font-semibold text-graphite-900 border border-graphite-900 hover:bg-graphite-900 hover:text-white transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-graphite-900"
                aria-disabled="true"
              >
                {t("dashboard_withdraw_balance")}
              </button>
            )}
          </div>
        </section>

        {/* 2. KPI row + Balance card ------------------------------------- */}
        {!isUserOnly && (
          <section
            className="grid lg:grid-cols-12 gap-5 mb-10"
            aria-label={t("dashboard_kpi_section_aria")}
          >
            <div className="lg:col-span-8 grid sm:grid-cols-3 gap-5">
              <KpiCard
                id="kpi-sales"
                icon={Package}
                tone="orange"
                value="7"
                label={`${t("dashboard_count_sales")} ${t(
                  "dashboard_count_done"
                )}`}
                caption={t("dashboard_kpi_sales_caption")}
              />
              <KpiCard
                id="kpi-customers"
                icon={Users}
                tone="blue"
                value="6"
                label={`${t("dashboard_count_customers")} ${t(
                  "dashboard_count_added"
                )}`}
                caption={t("dashboard_kpi_customers_caption")}
              />
              <KpiCard
                id="kpi-invoices"
                icon={Receipt}
                tone="green"
                value="15"
                label={`${t("dashboard_count_paid")} ${t(
                  "dashboard_count_invoices"
                )}`}
                caption={t("dashboard_kpi_invoices_caption")}
              />
            </div>

            <BalanceCard
              balanceLabel={t("dashboard_current_balance")}
              balance={invoiceContext.balance ?? 0}
              loadingBalance={invoiceContext.loadingBalance}
              availableLabel={
                isSeller ? t("dashboard_amount_released_for_withdrawal") : undefined
              }
              availableBalance={isSeller ? invoiceContext.availableBalance ?? 0 : undefined}
              loadingAvailable={isSeller && invoiceContext.loadingAvailableBalance}
              ctaLabel={t("dashboard_withdrawal")}
              ctaDisabled
            />
          </section>
        )}

        {/* 3. Tabs + statement table ------------------------------------- */}
        <section aria-labelledby="dashboard-ledger-heading">
          <h2 id="dashboard-ledger-heading" className="sr-only">
            {t("dashboard_movements_heading")}
          </h2>

          <div
            role="tablist"
            aria-label={t("dashboard_movements_aria")}
            className="flex items-center gap-1 mb-5 border-b border-graphite-100"
          >
            <button
              type="button"
              role="tab"
              id="dashboard-tab-statement"
              aria-selected={activeTab === "statement"}
              aria-controls="dashboard-panel-statement"
              onClick={() => setActiveTab("statement")}
              className={`inline-flex items-center gap-2 h-12 px-4 text-sm font-semibold border-b-2 -mb-px transition-colors duration-fast ${
                activeTab === "statement"
                  ? "text-graphite-900 border-orange-500"
                  : "text-graphite-500 border-transparent hover:text-graphite-900"
              }`}
            >
              <DollarSign size={16} aria-hidden="true" />
              {t("dashboard_statement")}
            </button>

            <button
              type="button"
              role="tab"
              id="dashboard-tab-orders"
              aria-selected={false}
              aria-disabled="true"
              tabIndex={-1}
              disabled
              className="inline-flex items-center gap-2 h-12 px-4 text-sm font-semibold border-b-2 border-transparent -mb-px text-graphite-300 cursor-not-allowed"
            >
              <ShoppingBag size={16} aria-hidden="true" />
              {t("dashboard_orders_tab")}
              <span className="ml-1 text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-300">
                {t("dashboard_tabs_orders_soon")}
              </span>
            </button>
          </div>

          <StatementPart
            loading={invoiceContext.loadingSearch}
            StatementResult={invoiceContext.statementResult}
            onChangePage={(pageNum: number) => {
              searchStatements(pageNum);
            }}
          />
        </section>
      </div>
    </main>
  );
}
