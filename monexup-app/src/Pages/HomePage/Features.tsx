import { useTranslation } from "react-i18next";
import {
  Coins,
  TrendingUp,
  QrCode,
  UserCheck,
  LayoutDashboard,
  Award,
  type LucideIcon,
} from "lucide-react";

/**
 * Features — light-surface capability grid.
 *
 * Spec: 6 cards in `sm:grid-cols-2 lg:grid-cols-3`. The 6th card is
 * inverted (graphite-900 surface) on purpose — it's the brutalist accent
 * that breaks the grid rhythm.
 */

interface FeatureItem {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  inverted?: boolean;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Coins,
    titleKey: "home_feature_donations_title",
    descKey: "home_feature_donations_desc",
  },
  {
    icon: TrendingUp,
    titleKey: "home_feature_commissions_title",
    descKey: "home_feature_commissions_desc",
  },
  {
    icon: QrCode,
    titleKey: "home_feature_pix_title",
    descKey: "home_feature_pix_desc",
  },
  {
    icon: UserCheck,
    titleKey: "home_feature_team_management_title",
    descKey: "home_feature_team_management_desc",
  },
  {
    icon: LayoutDashboard,
    titleKey: "home_feature_admin_panel_title",
    descKey: "home_feature_admin_panel_desc",
  },
  {
    icon: Award,
    titleKey: "home_feature_security_transparency_title",
    descKey: "home_feature_security_transparency_desc",
    inverted: true,
  },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <section
      id="features"
      className="mnx-surface-light bg-mnx-neutral-50 py-20 lg:py-28"
    >
      <div className="max-w-container mx-auto px-shell">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 mb-3">
            {t("home_features_eyebrow")}
          </p>
          <h2 className="display-headline text-graphite-900 text-4xl lg:text-5xl">
            {t("home_features_title")}
          </h2>
          <p className="mt-5 text-lg text-graphite-500 leading-relaxed">
            {t("home_features_subtitle")}
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((item) => {
            const Icon = item.icon;

            if (item.inverted) {
              return (
                <article
                  key={item.titleKey}
                  className="group relative bg-graphite-900 rounded-2xl p-7 border border-graphite-900 transition-all duration-normal overflow-hidden hover:shadow-lg"
                >
                  <div
                    className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-orange-500/20 blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-5">
                    <Icon size={24} className="text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-mnx-neutral-50 mb-2">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-sm text-graphite-200 leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </article>
              );
            }

            return (
              <article
                key={item.titleKey}
                className="group relative bg-white rounded-2xl p-7 border border-mnx-neutral-200 hover:border-graphite-900 hover:shadow-lg transition-all duration-normal"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-5 group-hover:bg-orange-500 transition-colors duration-normal">
                  <Icon
                    size={24}
                    className="text-orange-600 group-hover:text-white transition-colors duration-normal"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display text-xl font-semibold text-graphite-900 mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm text-graphite-500 leading-relaxed">
                  {t(item.descKey)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
