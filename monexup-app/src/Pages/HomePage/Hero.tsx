import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Zap, ChevronUp } from "lucide-react";

/**
 * Hero — dark editorial-brutalist hero block.
 *
 * Was previously embedded inside `Header.tsx`; split out per the home redesign
 * spec so the navbar stays sticky-only and the hero owns headline + CTAs +
 * dashboard mock + trust bar.
 *
 * Surface: dark (`mnx-surface-dark` + `bg-mesh-hero`).
 * Anchor: `#home` for the navbar link.
 */
export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="mnx-surface-dark relative overflow-hidden bg-mesh-hero"
    >
      <div
        className="hero-grid absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-container mx-auto px-shell pt-16 lg:pt-24 pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Copy column ----------------------------------------------------- */}
          <div className="lg:col-span-7 animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase text-orange-200 bg-orange-500/10 border border-orange-500/30">
              <span
                className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"
                aria-hidden="true"
              />
              {t("home_hero_eyebrow")}
            </span>

            <h1 className="display-headline text-mnx-neutral-50 mt-6 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.625rem]">
              {t("home_hero_title_line1")}
              <br />
              {t("home_hero_title_line2")}
              <br />
              <span className="text-orange-500">
                {t("home_hero_title_line3")}
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-graphite-200 text-lg lg:text-xl leading-relaxed">
              {t("header_subtitle")}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/new-seller")}
                className="cta-primary inline-flex h-14 items-center justify-center px-8 rounded-md text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-normal shadow-glow-lg"
              >
                <Zap size={20} className="mr-2" aria-hidden="true" />
                {t("be_a_representative")}
              </button>
              <a
                href="#networks"
                className="inline-flex h-14 items-center justify-center px-8 rounded-md text-base font-semibold text-mnx-neutral-50 border border-white/30 hover:border-white/60 hover:bg-white/5 transition-colors duration-normal"
              >
                {t("home_hero_explore_networks")}
              </a>
            </div>

            {/* Trust bar --------------------------------------------------- */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="font-display text-3xl font-bold text-mnx-neutral-50">
                  +12k
                </p>
                <p className="text-xs uppercase tracking-wider text-graphite-300 mt-1">
                  {t("home_hero_stat_representatives")}
                </p>
              </div>
              <div className="border-l border-white/10 pl-6">
                <p className="font-display text-3xl font-bold text-mnx-neutral-50">
                  340+
                </p>
                <p className="text-xs uppercase tracking-wider text-graphite-300 mt-1">
                  {t("home_hero_stat_active_networks")}
                </p>
              </div>
              <div className="border-l border-white/10 pl-6">
                <p className="font-display text-3xl font-bold text-mnx-neutral-50">
                  R$ 4.2M
                </p>
                <p className="text-xs uppercase tracking-wider text-graphite-300 mt-1">
                  {t("home_hero_stat_paid_commissions")}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard mock column ------------------------------------------- */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div
                className="absolute -inset-6 bg-orange-500/20 rounded-2xl blur-3xl"
                aria-hidden="true"
              />

              <div
                className="relative rounded-2xl bg-graphite-700/90 backdrop-blur border border-white/10 p-6 shadow-xl"
                role="presentation"
                aria-hidden="true"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-graphite-300">
                      {t("home_hero_mock_commissions_title")}
                    </p>
                    <p className="font-display text-3xl font-bold text-mnx-neutral-50 mt-1">
                      R$ 18.420,00
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                    <ChevronUp size={12} strokeWidth={3} />
                    +24%
                  </span>
                </div>

                <div className="h-32 flex items-end gap-1.5 mb-6">
                  <div className="flex-1 bg-white/10 rounded-sm" style={{ height: "32%" }} />
                  <div className="flex-1 bg-white/10 rounded-sm" style={{ height: "48%" }} />
                  <div className="flex-1 bg-white/15 rounded-sm" style={{ height: "38%" }} />
                  <div className="flex-1 bg-white/15 rounded-sm" style={{ height: "62%" }} />
                  <div className="flex-1 bg-orange-500/40 rounded-sm" style={{ height: "55%" }} />
                  <div className="flex-1 bg-orange-500/60 rounded-sm" style={{ height: "78%" }} />
                  <div className="flex-1 bg-orange-500/70 rounded-sm" style={{ height: "68%" }} />
                  <div className="flex-1 bg-orange-500/80 rounded-sm" style={{ height: "88%" }} />
                  <div className="flex-1 bg-orange-500 rounded-sm shadow-glow-md" style={{ height: "100%" }} />
                  <div className="flex-1 bg-orange-500/80 rounded-sm" style={{ height: "74%" }} />
                  <div className="flex-1 bg-orange-500/60 rounded-sm" style={{ height: "62%" }} />
                  <div className="flex-1 bg-orange-500/50 rounded-sm" style={{ height: "80%" }} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="node" />
                    <span className="text-sm text-mnx-neutral-50 flex-1">
                      Rede Alpha · 84 vendedores
                    </span>
                    <span className="text-xs font-medium text-orange-300">
                      +R$ 2.140
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                    <span className="node" />
                    <span className="text-sm text-graphite-200 flex-1">
                      Rede Phoenix · 51 vendedores
                    </span>
                    <span className="text-xs font-medium text-orange-300">
                      +R$ 1.620
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pl-8">
                    <span className="node node--dim" />
                    <span className="text-sm text-graphite-300 flex-1">
                      Rede Nova · 22 vendedores
                    </span>
                    <span className="text-xs font-medium text-graphite-300">
                      +R$ 480
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
