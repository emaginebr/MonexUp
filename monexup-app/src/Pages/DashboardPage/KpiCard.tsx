import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

export type KpiTone = "orange" | "blue" | "green";

export type KpiTrendDirection = "up" | "down" | "flat";

export interface KpiCardProps {
  /** Lucide icon component for the colored chip. */
  icon: LucideIcon;
  /** Color variant of the icon chip — one of the 3 semantic accents. */
  tone: KpiTone;
  /** Pre-formatted value (e.g. "7", "R$ 1.480,00"). */
  value: string | number;
  /** Short uppercase label ("Vendas realizadas"). */
  label: string;
  /** Optional sub-text below the label. */
  caption?: string;
  /** Optional trend indicator — defaults to no pill. */
  trend?: {
    delta: string;
    direction: KpiTrendDirection;
    /** Full semantic for SR users (never relies on color alone). */
    ariaLabel?: string;
  };
  /** Stable id used to wire `aria-labelledby`. */
  id?: string;
}

/**
 * KpiCard — flat white stat card.
 *
 * Visual contract: see `docs/design/dashboard-redesign.html` section 2b
 * and `docs/design/dashboard-spec.md` section 2. Used 3x on the dashboard
 * (Vendas / Clientes / Faturas) and reusable on any future surface that
 * needs a single-metric tile.
 */
export default function KpiCard({
  icon: Icon,
  tone,
  value,
  label,
  caption,
  trend,
  id,
}: KpiCardProps) {
  const chipClass = `mnx-stat-chip mnx-stat-chip--${tone}`;
  const valueId = id ? `${id}-value` : undefined;

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
      ? TrendingDown
      : Minus;

  return (
    <article
      className="bg-white rounded-2xl border border-graphite-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-normal"
      aria-labelledby={valueId}
    >
      <div className="flex items-start justify-between">
        <span className={chipClass} aria-hidden="true">
          <Icon size={22} />
        </span>

        {trend && (
          <span
            className={`mnx-trend-pill mnx-trend-pill--${trend.direction}`}
            aria-label={trend.ariaLabel ?? trend.delta}
          >
            <TrendIcon size={10} aria-hidden="true" />
            {trend.delta}
          </span>
        )}
      </div>

      <p
        id={valueId}
        className="mnx-num text-graphite-900 text-4xl mt-5 font-bold"
      >
        {value}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wider font-semibold text-graphite-400">
        {label}
      </p>
      {caption && (
        <p className="mt-1 text-xs text-graphite-500">{caption}</p>
      )}
    </article>
  );
}
