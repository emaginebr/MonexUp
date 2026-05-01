import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MessageCircle } from "lucide-react";
import UserInfo from "../../DTO/Domain/UserInfo";
import { Skeleton } from "../../components/ui/skeleton";

interface IUserParam {
  loading: boolean;
  users: UserInfo[];
}

const AVATAR_GRADIENTS = [
  "from-orange-400 to-orange-600",
  "from-graphite-700 to-graphite-900",
  "from-orange-300 to-orange-500",
  "from-graphite-500 to-graphite-700",
];

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function UserPart(param: IUserParam) {
  const { t } = useTranslation();

  return (
    <section className="mnx-surface-light bg-white py-20 lg:py-28 border-t border-mnx-neutral-200">
      <div className="max-w-container mx-auto px-shell">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 mb-3">
            {t("home_userpart_eyebrow")}
          </p>
          <h2 className="display-headline text-graphite-900 text-4xl lg:text-5xl">
            {t("home_userpart_title")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {param.loading &&
            [1, 2, 3, 4].map((index) => (
              <article key={`skeleton-${index}`} className="text-center">
                <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                <Skeleton className="h-4 w-2/3 mx-auto mb-2" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </article>
            ))}

          {!param.loading &&
            param.users?.map((user, index) => {
              const initials = getInitials(user.name);
              const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

              return (
                <article key={user.userId ?? user.slug} className="text-center">
                  <div className="relative inline-block mb-4">
                    <Link to={`/@/${user.slug}`} aria-label={user.name}>
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-32 h-32 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-display font-bold text-3xl`}
                          role="img"
                          aria-label={`Iniciais ${initials}`}
                        >
                          {initials}
                        </div>
                      )}
                    </Link>
                    <span
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white"
                      style={{ background: "var(--color-success-500)" }}
                      aria-label={t("home_userpart_status_online")}
                    />
                  </div>
                  <h3 className="font-display text-base font-semibold text-graphite-900">
                    <Link
                      to={`/@/${user.slug}`}
                      className="hover:text-orange-600 transition-colors duration-fast"
                    >
                      {user.name}
                    </Link>
                  </h3>
                  <div className="mt-3 flex justify-center gap-3 text-graphite-400">
                    <a
                      href={user.email ? `mailto:${user.email}` : "#"}
                      aria-label={`${t("home_userpart_email_aria")} ${user.name}`}
                      className="hover:text-graphite-900 transition-colors duration-fast"
                    >
                      <Mail size={16} />
                    </a>
                    <a
                      href="#"
                      aria-label={`${t("home_userpart_whatsapp_aria")} ${user.name}`}
                      className="hover:text-graphite-900 transition-colors duration-fast"
                    >
                      <MessageCircle size={16} />
                    </a>
                  </div>
                </article>
              );
            })}

          {!param.loading && (!param.users || param.users.length === 0) && (
            <div className="col-span-full text-center py-12 text-graphite-500">
              <p>{t("home_userpart_empty")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
