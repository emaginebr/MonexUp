import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

/**
 * Pricing — light surface, 3-tier ladder. Middle plan is dark to interrupt the row.
 */
export default function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const freePlan = {
    name: t("home_pricing_free_plan"),
    description: t("home_pricing_free_subtitle"),
    price: t("home_pricing_free_price"),
    period: t("home_pricing_per_month"),
    features: [
      t("home_pricing_free_feature1"),
      t("home_pricing_free_feature2"),
      t("home_pricing_free_feature3"),
      t("home_pricing_free_feature4"),
    ],
    ctaLabel: t("home_pricing_free_button"),
    onClick: () => navigate("/network"),
  };

  const proPlan = {
    name: t("home_pricing_pro_plan"),
    description: t("home_pricing_pro_subtitle"),
    price: t("home_pricing_pro_price"),
    period: t("home_pricing_per_month"),
    features: [
      t("home_pricing_pro_feature1"),
      t("home_pricing_pro_feature2"),
      t("home_pricing_pro_feature3"),
      t("home_pricing_pro_feature4"),
    ],
    ctaLabel: t("home_pricing_coming_soon"),
    onClick: () => navigate("/monexup/pro"),
  };

  const enterprisePlan = {
    name: t("home_pricing_enterprise_plan"),
    description: t("home_pricing_enterprise_subtitle"),
    price: t("home_pricing_enterprise_price"),
    period: t("home_pricing_per_month"),
    features: [
      t("home_pricing_enterprise_feature1"),
      t("home_pricing_enterprise_feature2"),
      t("home_pricing_enterprise_feature3"),
      t("home_pricing_enterprise_feature4"),
    ],
    ctaLabel: t("home_pricing_enterprise_button"),
    onClick: () => navigate("/monexup/pro"),
  };

  return (
    <section
      id="plans"
      className="mnx-surface-light bg-mnx-neutral-50 py-20 lg:py-28 border-t border-mnx-neutral-200"
    >
      <div className="max-w-container mx-auto px-shell">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 mb-3">
            {t("home_pricing_eyebrow")}
          </p>
          <h2 className="display-headline text-graphite-900 text-4xl lg:text-5xl">
            {t("home_pricing_title")}
          </h2>
          <p className="mt-5 text-lg text-graphite-500 leading-relaxed">
            {t("home_pricing_lead")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {/* Free / Iniciante --------------------------------------------- */}
          <article className="bg-white rounded-2xl p-8 border border-mnx-neutral-200">
            <h3 className="font-display text-xl font-semibold text-graphite-900">
              {freePlan.name}
            </h3>
            <p className="text-sm text-graphite-500 mt-1">{freePlan.description}</p>
            <div className="mt-6 mb-6 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold text-graphite-900">
                {freePlan.price}
              </span>
              <span className="text-sm text-graphite-400">
                {freePlan.period}
              </span>
            </div>
            <ul className="space-y-3 text-sm text-graphite-500 mb-8">
              {freePlan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check
                    size={16}
                    strokeWidth={3}
                    className="text-orange-500 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={freePlan.onClick}
              className="inline-flex w-full h-12 items-center justify-center rounded-md text-sm font-semibold text-graphite-900 border border-graphite-900 hover:bg-graphite-900 hover:text-white transition-colors duration-normal"
            >
              {freePlan.ctaLabel}
            </button>
          </article>

          {/* Pro (featured / dark) ---------------------------------------- */}
          <article
            className="relative bg-graphite-900 text-mnx-neutral-50 rounded-2xl p-8 border-2 border-orange-500 shadow-glow-md lg:-mt-4"
            aria-label={`${t("home_pricing_pro_plan")} — ${t(
              "home_pricing_most_popular"
            )}`}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500 text-white">
              {t("home_pricing_most_popular")}
            </span>
            <h3 className="font-display text-xl font-semibold">
              {proPlan.name}
            </h3>
            <p className="text-sm text-graphite-200 mt-1">
              {proPlan.description}
            </p>
            <div className="mt-6 mb-6 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold">
                {proPlan.price}
              </span>
              <span className="text-sm text-graphite-300">{proPlan.period}</span>
            </div>
            <ul className="space-y-3 text-sm text-graphite-200 mb-8">
              {proPlan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check
                    size={16}
                    strokeWidth={3}
                    className="text-orange-400 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={proPlan.onClick}
              className="cta-primary inline-flex w-full h-12 items-center justify-center rounded-md text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-normal shadow-glow-md"
            >
              {proPlan.ctaLabel}
            </button>
          </article>

          {/* Enterprise --------------------------------------------------- */}
          <article className="bg-white rounded-2xl p-8 border border-mnx-neutral-200">
            <h3 className="font-display text-xl font-semibold text-graphite-900">
              {enterprisePlan.name}
            </h3>
            <p className="text-sm text-graphite-500 mt-1">
              {enterprisePlan.description}
            </p>
            <div className="mt-6 mb-6 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold text-graphite-900">
                {enterprisePlan.price}
              </span>
            </div>
            <ul className="space-y-3 text-sm text-graphite-500 mb-8">
              {enterprisePlan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check
                    size={16}
                    strokeWidth={3}
                    className="text-orange-500 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={enterprisePlan.onClick}
              className="inline-flex w-full h-12 items-center justify-center rounded-md text-sm font-semibold text-graphite-900 border border-graphite-900 hover:bg-graphite-900 hover:text-white transition-colors duration-normal"
            >
              {enterprisePlan.ctaLabel}
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
