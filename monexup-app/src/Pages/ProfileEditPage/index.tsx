import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ChevronRight,
  Layers,
  Percent,
  Save,
  User as UserIcon,
} from "lucide-react";

import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProfileContext from "../../Contexts/Profile/ProfileContext";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import UserProfileInfo from "../../DTO/Domain/UserProfileInfo";

import FormField from "../NetworkEditPage/FormField";

/**
 * ProfileEditPage — redesigned `/admin/team-structure/new` and
 * `/admin/team-structure/:profileId` route.
 *
 * Visual contract: matches the freshly redesigned ProfileListPage
 * (compact page header with 2px orange accent bar + `display-headline` +
 * breadcrumb in the `ml-[14px]` slot, single `auth-card` body, no sticky
 * save bar). Rendered inside `LayoutAdmin` which already injects the
 * dark `HomeHeader` — this component does NOT render any header chrome.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - on mount: when `:profileId > 0`, calls `profileContext.getById(id)`;
 *     otherwise seeds an empty profile via `setProfile(...)`
 *   - keystrokes write back through `profileContext.setProfile(...)`
 *   - save calls `insert(...)` in insert mode, `update(...)` otherwise
 *   - success and error are routed through the existing `MessageToast`
 *   - `Voltar` returns to `/admin/team-structure`
 *
 * No new dependencies, no Dialog primitives, no sticky bars. Save / Voltar
 * sit on the right side of the page header (parity with the editorial
 * pages).
 */
export default function ProfileEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profileId } = useParams();

  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);
  const profileContext = useContext(ProfileContext);

  const [insertMode, setInsertMode] = useState<boolean>(false);
  const [bootstrapping, setBootstrapping] = useState<boolean>(true);

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

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

  useEffect(() => {
    const seed: UserProfileInfo = {
      profileId: 0,
      networkId: networkContext.userNetwork?.networkId,
      name: "",
      level: 0,
      commission: 0,
      members: 0,
    };

    if (authContext.sessionInfo) {
      const profileIdNum: number = parseInt(profileId);
      if (profileIdNum > 0) {
        profileContext.getById(profileIdNum).then((ret) => {
          if (ret.sucesso) {
            setInsertMode(false);
          } else {
            setInsertMode(true);
            profileContext.setProfile(seed);
          }
          setBootstrapping(false);
        });
      } else {
        setInsertMode(true);
        profileContext.setProfile(seed);
        setBootstrapping(false);
      }
    } else {
      setInsertMode(true);
      profileContext.setProfile(seed);
      setBootstrapping(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (insertMode) {
      const ret = await profileContext.insert(profileContext.profile);
      if (ret.sucesso) {
        showSuccessMessage(ret.mensagemSucesso);
      } else {
        throwError(ret.mensagemErro);
      }
    } else {
      const ret = await profileContext.update(profileContext.profile);
      if (ret.sucesso) {
        showSuccessMessage(ret.mensagemSucesso);
      } else {
        throwError(ret.mensagemErro);
      }
    }
  };

  const profile = profileContext.profile;
  const isLoading = bootstrapping || (profileContext.loading && !insertMode);

  const headlineText = insertMode
    ? t("new")
    : profile?.name && profile.name.trim().length > 0
      ? profile.name
      : t("editTeamStructure");

  const breadcrumbCurrent = insertMode
    ? t("new")
    : profile?.name && profile.name.trim().length > 0
      ? profile.name
      : t("editTeamStructure");

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={dialog}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />

      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band (ProfileListPage parity) ------------------ */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="profile-edit-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="profile-edit-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight truncate max-w-[18rem] sm:max-w-[26rem] lg:max-w-[32rem]"
              >
                {headlineText}
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
                <li>
                  <Link
                    to="/admin/team-structure"
                    className="hover:text-orange-600 transition-colors duration-fast"
                  >
                    {t("profileListPage.networkTeamStructure")}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-graphite-300">
                  <ChevronRight size={14} />
                </li>
                <li
                  aria-current="page"
                  className="font-medium text-graphite-700 truncate max-w-[14rem]"
                >
                  {breadcrumbCurrent}
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/admin/team-structure")}
              className="inline-flex h-9 items-center gap-2 px-3 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t("back_button")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={profileContext.loadingUpdate}
              className="cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
            >
              {profileContext.loadingUpdate ? (
                t("loading")
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  {t("save_button")}
                </>
              )}
            </button>
          </div>
        </section>

        {/* 2. Form card -------------------------------------------------- */}
        <section
          aria-label={t("editTeamStructure")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {isLoading ? (
            <div className="space-y-5" aria-busy="true">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-5"
            >
              <FormField
                id="profile-edit-name"
                label={t("name")}
                icon={UserIcon}
              >
                <input
                  id="profile-edit-name"
                  type="text"
                  placeholder={t("yourProfileName")}
                  value={profile?.name ?? ""}
                  onChange={(e) =>
                    profileContext.setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                  className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400"
                />
              </FormField>

              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  id="profile-edit-level"
                  label={t("profileListPage.level")}
                  icon={Layers}
                >
                  <input
                    id="profile-edit-level"
                    type="number"
                    min={0}
                    placeholder={t("networkLevelNumber")}
                    value={profile?.level ?? ""}
                    onChange={(e) =>
                      profileContext.setProfile({
                        ...profile,
                        level: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 mnx-num"
                  />
                </FormField>

                <FormField
                  id="profile-edit-commission"
                  label={t("profileListPage.commission")}
                  icon={Percent}
                  suffix="%"
                >
                  <input
                    id="profile-edit-commission"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    placeholder={t("commissionInPercents")}
                    value={profile?.commission ?? ""}
                    onChange={(e) =>
                      profileContext.setProfile({
                        ...profile,
                        commission: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 mnx-num"
                  />
                </FormField>
              </div>

              {/* Hidden submit so Enter triggers handleSave through the form. */}
              <button type="submit" className="hidden" aria-hidden="true" />
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
