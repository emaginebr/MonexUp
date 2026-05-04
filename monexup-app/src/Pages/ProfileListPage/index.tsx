import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layers, Plus } from "lucide-react";

import ProfileContext from "../../Contexts/Profile/ProfileContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";

import ProfileListRow from "./ProfileListRow";

/**
 * ProfileListPage — redesigned `/admin/team-structure` route.
 *
 * Visual contract: matches the editorial-brutalist light surface used by
 * DashboardPage and the redesigned NetworkEditPage. Rendered inside
 * `LayoutAdmin` which already injects the dark `HomeHeader`, so this
 * component does NOT render any header chrome.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - reads `profileContext.profiles` and the `loading` flag
 *   - calls `listByNetwork(networkId)` on mount
 *   - keeps the legacy delete confirmation flow via `MessageToast`
 *     (Confirmation variant) — no Dialog primitive introduced
 *   - links to `/admin/team-structure/new` and `/admin/team-structure/:id`
 *   - reuses every existing i18n key under `profileListPage.*`; new
 *     copy keys (subtitle, emptyTitle, emptyBody) added to all four locales
 */
export default function ProfileListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const networkContext = useContext(NetworkContext);
  const profileContext = useContext(ProfileContext);

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [pendingProfile, setPendingProfile] =
    useState<UserProfileInfo | null>(null);

  const throwError = (message: string) => {
    setDialog(MessageToastEnum.Error);
    setMessageText(message);
    setShowMessage(true);
  };
  const showSuccessMessage = (message: string) => {
    setDialog(MessageToastEnum.Success);
    setMessageText(message);
    setShowMessage(true);
  };
  const showDeleteMessage = (message: string) => {
    setDialog(MessageToastEnum.Confirmation);
    setMessageText(message);
    setShowMessage(true);
  };

  useEffect(() => {
    if (networkContext.userNetwork) {
      profileContext
        .listByNetwork(networkContext.userNetwork.networkId)
        .then((ret) => {
          if (!ret.sucesso) {
            throwError(ret.mensagemErro);
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteRequest = (profile: UserProfileInfo) => {
    setPendingProfile(profile);
    showDeleteMessage(t("areYouSure"));
  };

  const handleDeleteConfirm = async () => {
    if (pendingProfile) {
      const ret = await profileContext.delete(pendingProfile.profileId);
      if (ret.sucesso) {
        showSuccessMessage(t("profileListPage.profileSuccessfullyDeleted"));
        const retList = await profileContext.listByNetwork(
          networkContext.userNetwork.networkId
        );
        if (!retList.sucesso) {
          throwError(retList.mensagemErro);
        }
      } else {
        throwError(ret.mensagemErro);
      }
      setPendingProfile(null);
    }
    setShowMessage(false);
  };

  const goToNew = () => navigate("/admin/team-structure/new");

  const profiles = profileContext.profiles ?? [];
  const isLoading = profileContext.loading;
  const isEmpty = !isLoading && profiles.length === 0;

  const rowLabels = {
    name: t("profileListPage.profileName"),
    level: t("profileListPage.level"),
    commission: t("profileListPage.commission"),
    members: t("profileListPage.members"),
    edit: t("editTeamStructure"),
    delete: t("userSearchPage.actions.remove"),
  };

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={dialog}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => {
          setShowMessage(false);
          setPendingProfile(null);
        }}
        onYes={handleDeleteConfirm}
        onNo={() => {
          setShowMessage(false);
          setPendingProfile(null);
        }}
      />

      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band (dashboard parity) ------------------------ */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="profile-list-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="profile-list-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("profileListPage.networkTeamStructure")}
              </h1>
            </div>
            <nav
              aria-label="Breadcrumb"
              className="mt-2 ml-[14px] text-sm"
            >
              <ol className="flex items-center gap-1 text-graphite-500">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-orange-600 transition-colors duration-fast"
                  >
                    {t("profileListPage.myNetwork")}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-graphite-300">
                  <ChevronRight size={14} />
                </li>
                <li
                  aria-current="page"
                  className="font-medium text-graphite-700 truncate max-w-[14rem]"
                >
                  {t("profileListPage.networkTeamStructure")}
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={goToNew}
              className="cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast"
            >
              <Plus size={16} aria-hidden="true" />
              {t("new")}
            </button>
          </div>
        </section>

        {/* 2. List card -------------------------------------------------- */}
        <section
          aria-label={t("profileListPage.networkTeamStructure")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {/* List body ------------------------------------------------- */}
          <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
            {/* Desktop column header --------------------------------- */}
            {!isEmpty && (
              <div
                className="hidden md:!grid grid-cols-12 gap-4 px-4 h-11 items-center bg-mnx-neutral-50 border-b border-mnx-neutral-200"
                role="row"
              >
                <div
                  className="col-span-5 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("profileListPage.profileName")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("profileListPage.level")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("profileListPage.commission")} (%)
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("profileListPage.members")}
                </div>
                <div
                  className="col-span-1 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  <span className="sr-only">
                    {t("profileListPage.actions")}
                  </span>
                </div>
              </div>
            )}

            {/* Loading state ----------------------------------------- */}
            {isLoading && (
              <div className="divide-y divide-mnx-neutral-100" aria-busy="true">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="px-4 h-14 hidden md:!grid grid-cols-12 items-center gap-4"
                  >
                    <Skeleton className="col-span-5 h-4 max-w-[60%]" />
                    <Skeleton className="col-span-2 h-4 ml-auto w-12" />
                    <Skeleton className="col-span-2 h-4 ml-auto w-16" />
                    <Skeleton className="col-span-2 h-4 ml-auto w-12" />
                    <Skeleton className="col-span-1 h-4 ml-auto w-16" />
                  </div>
                ))}
                {[0, 1, 2].map((idx) => (
                  <div
                    key={`m-${idx}`}
                    className="px-4 py-4 md:hidden space-y-3"
                  >
                    <Skeleton className="h-5 w-2/3" />
                    <div className="grid grid-cols-3 gap-3">
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state ------------------------------------------- */}
            {isEmpty && (
              <div className="px-6 py-14 text-center">
                <span
                  className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
                  aria-hidden="true"
                >
                  <Layers size={22} />
                </span>
                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                  {t("profileListPage.emptyTitle")}
                </h3>
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                  {t("profileListPage.emptyBody")}
                </p>
                <button
                  type="button"
                  onClick={goToNew}
                  className="cta-primary inline-flex h-10 items-center gap-2 px-5 mt-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast"
                >
                  <Plus size={16} aria-hidden="true" />
                  {t("new")}
                </button>
              </div>
            )}

            {/* Rows -------------------------------------------------- */}
            {!isLoading && !isEmpty && (
              <div role="rowgroup">
                {profiles.map((profile) => (
                  <ProfileListRow
                    key={profile.profileId}
                    profile={profile}
                    labels={rowLabels}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
