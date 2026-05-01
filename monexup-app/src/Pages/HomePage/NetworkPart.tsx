import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import NetworkInfo from "../../DTO/Domain/NetworkInfo";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";

interface INetworkParam {
  loading: boolean;
  networks: NetworkInfo[];
}

/**
 * NetworkPart — light-surface "redes em destaque" grid.
 * Wires straight into NetworkContext (`networks` + `loading`) — context code
 * is left untouched per the migration scope.
 */
export default function NetworkPart(param: INetworkParam) {
  const { t } = useTranslation();

  return (
    <section
      id="networks"
      className="mnx-surface-light bg-white py-20 lg:py-28 border-t border-mnx-neutral-200"
    >
      <div className="max-w-container mx-auto px-shell">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 mb-3">
              {t("home_networkpart_eyebrow")}
            </p>
            <h2 className="display-headline text-graphite-900 text-4xl lg:text-5xl">
              {t("home_networkpart_title")}
            </h2>
          </div>
          <Link
            to="/network/search"
            className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-900 hover:text-orange-600 transition-colors duration-fast"
          >
            {t("home_networkpart_view_all")}
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {param.loading &&
            [1, 2, 3, 4].map((index) => (
              <article
                key={`skeleton-${index}`}
                className="bg-mnx-neutral-50 rounded-2xl overflow-hidden border border-mnx-neutral-200"
              >
                <Skeleton className="h-32 w-full rounded-none" />
                <div className="p-5">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
              </article>
            ))}

          {!param.loading &&
            param.networks?.map((network, index) => (
              <article
                key={network.networkId ?? network.slug}
                className="bg-mnx-neutral-50 rounded-2xl overflow-hidden border border-mnx-neutral-200 hover:border-graphite-900 hover:-translate-y-1 transition-all duration-normal"
              >
                <Link
                  to={`/${network.slug}`}
                  className="block relative h-32 overflow-hidden"
                  aria-label={network.name}
                >
                  {network.imageUrl ? (
                    <img
                      src={network.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full ${
                        index % 2 === 0
                          ? "bg-gradient-to-br from-orange-400 to-orange-600"
                          : "bg-gradient-to-br from-graphite-700 to-graphite-900"
                      }`}
                    />
                  )}
                  {index === 0 && (
                    <Badge variant="light" className="absolute top-3 right-3">
                      {t("home_networkpart_trending")}
                    </Badge>
                  )}
                </Link>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-graphite-900">
                    <Link
                      to={`/${network.slug}`}
                      className="hover:text-orange-600 transition-colors duration-fast"
                    >
                      {network.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-graphite-500 mt-1">
                    {t("home_networkpart_affiliate_sellers", {
                      count: network.qtdyUsers,
                    })}
                    {" · "}
                    {t("home_networkpart_open_positions", {
                      count: network.maxUsers - network.qtdyUsers,
                    })}
                  </p>
                  <Link
                    to={`/${network.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-fast"
                  >
                    {t("home_networkpart_view_network")}
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </Link>
                </div>
              </article>
            ))}

          {!param.loading && (!param.networks || param.networks.length === 0) && (
            <div className="col-span-full text-center py-12 text-graphite-500">
              <p>{t("home_networkpart_empty")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
