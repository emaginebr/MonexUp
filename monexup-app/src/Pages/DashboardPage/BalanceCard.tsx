import { ArrowRight } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { useTranslation } from "react-i18next";

export interface BalanceCardProps {
  /** Pre-formatted total balance (e.g. "18.420,00"). */
  balance: string | number;
  /** Pre-formatted available-for-withdrawal amount. Hidden when undefined. */
  availableBalance?: string | number;
  /** Whether the balance amount is loading (skeleton). */
  loadingBalance?: boolean;
  /** Whether the available balance is loading (skeleton). */
  loadingAvailable?: boolean;
  /** Pre-formatted still-maturing amount. Hidden when undefined. */
  maturingBalance?: string | number;
  /** Whether the maturing balance is loading (skeleton). */
  loadingMaturing?: boolean;
  /** Localized label for the current balance ("Saldo Atual"). */
  balanceLabel: string;
  /** Localized label for the released-for-withdrawal section. */
  availableLabel?: string;
  /** Localized label for the still-maturing section. */
  maturingLabel?: string;
  /** Localized label for the CTA. */
  ctaLabel: string;
  /** Withdrawal CTA href (defaults to "#"). */
  ctaHref?: string;
  /** When true (default) the CTA is disabled — withdrawal is not yet wired. */
  ctaDisabled?: boolean;
}

/**
 * BalanceCard — focal money tile for the dashboard.
 *
 * Visual contract: see `docs/design/dashboard-redesign.html` section 2b
 * (right column) and `docs/design/dashboard-spec.md` section 3. Dark
 * surface (`mnx-surface-dark`) with mesh background and a subtle 40px
 * grid texture. Renders on top of `lg:col-span-4` of the KPI grid.
 */
export default function BalanceCard({
  balance,
  availableBalance,
  loadingBalance,
  loadingAvailable,
  maturingBalance,
  loadingMaturing,
  balanceLabel,
  availableLabel,
  maturingLabel,
  ctaLabel,
  ctaHref = "#",
  ctaDisabled = true,
}: BalanceCardProps) {
  const { t } = useTranslation();
  const hasAvailable = availableBalance !== undefined && availableLabel;
  const hasMaturing = maturingBalance !== undefined && maturingLabel;

  return (
    <article
      className="mnx-surface-dark relative lg:col-span-4 rounded-2xl overflow-hidden bg-mesh-balance p-6 sm:p-7 text-mnx-neutral-50"
      aria-labelledby="dashboard-balance-label"
    >
      <div
        className="balance-grid absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <p
            id="dashboard-balance-label"
            className="text-xs uppercase tracking-wider font-semibold text-graphite-300"
          >
            {balanceLabel}
          </p>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-wider bg-orange-500/15 text-orange-300 border border-orange-500/30"
            aria-label={t("dashboard_balance_live_aria")}
          >
            &middot; {t("dashboard_balance_live")}
          </span>
        </div>

        <p className="mnx-num mt-3 flex items-baseline gap-1.5">
          <span className="text-base text-graphite-300">R$</span>
          <span className="text-4xl sm:text-5xl font-bold text-mnx-neutral-50">
            {loadingBalance ? (
              <Skeleton width={140} baseColor="#1B1B1F" highlightColor="#27272A" />
            ) : (
              balance
            )}
          </span>
        </p>

        {hasAvailable && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-graphite-300">{availableLabel}</p>
            <p className="mnx-num mt-1 text-graphite-100">
              <span className="text-xs text-graphite-300">R$ </span>
              <span className="text-lg font-semibold">
                {loadingAvailable ? (
                  <Skeleton
                    width={80}
                    baseColor="#1B1B1F"
                    highlightColor="#27272A"
                  />
                ) : (
                  availableBalance
                )}
              </span>
            </p>
          </div>
        )}

        {hasMaturing && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-graphite-300">{maturingLabel}</p>
            <p className="mnx-num mt-1 text-graphite-100">
              <span className="text-xs text-graphite-300">R$ </span>
              <span className="text-lg font-semibold">
                {loadingMaturing ? (
                  <Skeleton
                    width={80}
                    baseColor="#1B1B1F"
                    highlightColor="#27272A"
                  />
                ) : (
                  maturingBalance
                )}
              </span>
            </p>
          </div>
        )}

        {/* Sparkline — decorative, static recipe matching the mockup. */}
        <div className="mt-5" aria-hidden="true">
          <svg
            viewBox="0 0 200 50"
            width="100%"
            height="44"
            preserveAspectRatio="none"
          >
            <path
              className="mnx-spark-fill"
              d="M0,38 L18,32 L36,34 L54,28 L72,30 L90,22 L108,25 L126,18 L144,14 L162,16 L180,9 L200,11 L200,50 L0,50 Z"
            />
            <path
              className="mnx-spark-stroke"
              d="M0,38 L18,32 L36,34 L54,28 L72,30 L90,22 L108,25 L126,18 L144,14 L162,16 L180,9 L200,11"
            />
          </svg>
        </div>

        <a
          href={ctaHref}
          aria-disabled={ctaDisabled}
          tabIndex={ctaDisabled ? -1 : 0}
          onClick={(event) => {
            if (ctaDisabled) event.preventDefault();
          }}
          className={`cta-primary mt-6 inline-flex w-full h-12 items-center justify-center px-5 rounded-md text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-normal shadow-glow-md ${
            ctaDisabled ? "opacity-60 cursor-not-allowed hover:bg-orange-500" : ""
          }`}
        >
          {ctaLabel}
          <ArrowRight size={16} className="ml-2" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
