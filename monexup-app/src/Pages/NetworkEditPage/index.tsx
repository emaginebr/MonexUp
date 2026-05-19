import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  AtSign,
  Calendar,
  Code as CodeIcon,
  Coins,
  ImagePlus,
  LayoutTemplate,
  Network as NetworkIcon,
  Percent,
  Save,
  User as UserIcon,
} from "lucide-react";

import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import MessageToast from "../../Components/MessageToast";
import { ImageModal, ImageTypeEnum } from "../../Components/ImageModal";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";

import SectionHeader from "./SectionHeader";
import FormField from "./FormField";

/**
 * NetworkEditPage — redesigned `/admin/network` route.
 *
 * Visual contract: matches the editorial-brutalist dark surface used by
 * DashboardPage (page header eyebrow + display-headline + supporting
 * paragraph) paired with the `auth-card` form surface from the auth pages.
 * The page is rendered inside `LayoutAdmin`, which already injects the
 * dark `HomeHeader` — this component intentionally does NOT render any
 * header chrome.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - reads `networkContext.network` and pushes updates back via
 *     `networkContext.setNetwork(...)` on every keystroke
 *   - calls `networkContext.update(...)` on save
 *   - `getById` on mount when an auth session and userNetwork exist
 *   - opens the shared `ImageModal` (Network) for image upload
 *   - reuses every existing i18n key; new keys were added to all four
 *     locales for the eyebrow/title/section copy
 */
export default function NetworkEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const authContext = useContext(AuthContext);
  const networkContext = useContext(NetworkContext);

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

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
    if (authContext.sessionInfo && networkContext.userNetwork) {
      networkContext
        .getById(networkContext.userNetwork.networkId)
        .then((ret) => {
          if (!ret.sucesso) {
            throwError(ret.mensagemErro);
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    const ret = await networkContext.update(networkContext.network);
    if (ret.sucesso) {
      showSuccessMessage(t("network_edit_update_success_message"));
    } else {
      throwError(ret.mensagemErro);
    }
  };

  const network = networkContext.network;
  const networkId = network?.networkId ?? 0;
  const slugValue = network?.slug ?? "";

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={dialog}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />

      <ImageModal
        Image={ImageTypeEnum.Network}
        networkId={network?.networkId}
        show={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSuccess={(url: string) => {
          networkContext.setNetwork({
            ...network,
            imageUrl: url,
          });
        }}
      />

      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band (compact, dashboard parity) -------------- */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="network-edit-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="network-edit-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("network_edit_title")}
              </h1>
            </div>
            <p className="mt-2 ml-[14px] text-graphite-500 text-sm max-w-2xl">
              {t("network_edit_subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex h-9 items-center gap-2 px-3 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t("back_button")}
            </button>
          </div>
        </section>

        {/* 2. Identity & branding card ----------------------------------- */}
        <section
          aria-labelledby="network-edit-identity-title"
          className="auth-card relative p-6 sm:p-8 mb-6 animate-fade-up"
        >
          <SectionHeader
            id="network-edit-identity-title"
            icon={NetworkIcon}
            eyebrow={t("network_edit_eyebrow")}
            title={t("network_edit_identity_section_title")}
            subtitle={t("network_edit_identity_section_subtitle")}
          />

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left — image dropzone ------------------------------------ */}
            <div className="lg:col-span-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-mnx-neutral-100 border border-dashed border-mnx-neutral-300">
                {network?.imageUrl ? (
                  <img
                    src={network.imageUrl}
                    alt={network?.name ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span
                      className="mnx-stat-chip mnx-stat-chip--orange"
                      aria-hidden="true"
                    >
                      <ImagePlus size={20} />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-graphite-700">
                      {t("network_edit_image_empty_title")}
                    </p>
                    <p className="mt-1 text-xs text-graphite-500">
                      {t("network_edit_image_empty_subtitle")}
                    </p>
                  </div>
                )}
              </div>

              {networkId > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowImageModal(true);
                  }}
                  className="mt-4 inline-flex w-full h-12 items-center justify-center gap-2 rounded-md border border-graphite-900 text-sm font-semibold text-graphite-900 hover:bg-graphite-900 hover:text-white transition-colors duration-fast"
                >
                  <ImagePlus size={16} aria-hidden="true" />
                  {t("network_edit_change_image_button")}
                </button>
              )}
            </div>

            {/* Right — identity fields ---------------------------------- */}
            <div className="lg:col-span-8 space-y-5">
              <p className="text-sm text-graphite-500 leading-relaxed">
                {t("network_edit_registration_info")}
              </p>

              <FormField
                id="network-edit-name"
                label={t("network_edit_name_label")}
                icon={UserIcon}
              >
                <input
                  id="network-edit-name"
                  type="text"
                  placeholder={t("network_edit_name_placeholder")}
                  value={network?.name ?? ""}
                  onChange={(e) =>
                    networkContext.setNetwork({
                      ...network,
                      name: e.target.value,
                    })
                  }
                  className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400"
                />
              </FormField>

              <FormField
                id="network-edit-slug"
                label={t("network_edit_slug_label")}
                icon={CodeIcon}
                helper={t("network_edit_slug_helper")}
                hint={
                  slugValue ? (
                    <span className="font-mono text-orange-700">
                      monexup.com/{slugValue}
                    </span>
                  ) : undefined
                }
              >
                <input
                  id="network-edit-slug"
                  type="text"
                  placeholder={t("network_edit_slug_placeholder")}
                  value={slugValue}
                  onChange={(e) =>
                    networkContext.setNetwork({
                      ...network,
                      slug: e.target.value,
                    })
                  }
                  className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 font-mono text-sm"
                />
              </FormField>

              <FormField
                id="network-edit-template"
                label={t("network_edit_template_label")}
                icon={LayoutTemplate}
                helper={t("network_edit_template_helper")}
              >
                <input
                  id="network-edit-template"
                  type="text"
                  maxLength={20}
                  placeholder={t("network_edit_template_placeholder")}
                  value={network?.template ?? ""}
                  onChange={(e) =>
                    networkContext.setNetwork({
                      ...network,
                      template: e.target.value,
                    })
                  }
                  className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 font-mono text-sm"
                />
              </FormField>

              <FormField
                id="network-edit-email"
                label={t("network_edit_email_label")}
                icon={AtSign}
              >
                <input
                  id="network-edit-email"
                  type="email"
                  placeholder={t("network_edit_email_placeholder")}
                  value={network?.email ?? ""}
                  onChange={(e) =>
                    networkContext.setNetwork({
                      ...network,
                      email: e.target.value,
                    })
                  }
                  className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400"
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* 3. Financial rules card --------------------------------------- */}
        <section
          aria-labelledby="network-edit-financial-title"
          className="auth-card relative p-6 sm:p-8 animate-fade-up"
        >
          <SectionHeader
            id="network-edit-financial-title"
            icon={Coins}
            title={t("network_edit_financial_section_title")}
            subtitle={t("network_edit_financial_section_subtitle")}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormField
              id="network-edit-commission"
              label={t("network_edit_commission_label")}
              icon={Percent}
              suffix="%"
            >
              <input
                id="network-edit-commission"
                type="number"
                min={0}
                max={100}
                placeholder={t("network_edit_commission_placeholder")}
                value={network?.comission ?? ""}
                onChange={(e) =>
                  networkContext.setNetwork({
                    ...network,
                    comission: parseInt(e.target.value),
                  })
                }
                className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 mnx-num"
              />
            </FormField>

            <FormField
              id="network-edit-withdrawal-min"
              label={t("network_edit_minimal_withdrawal_label")}
              icon={Coins}
              suffix="BRL"
            >
              <input
                id="network-edit-withdrawal-min"
                type="number"
                min={0}
                placeholder={t("network_edit_minimal_withdrawal_placeholder")}
                value={network?.withdrawalMin ?? ""}
                onChange={(e) =>
                  networkContext.setNetwork({
                    ...network,
                    withdrawalMin: parseFloat(e.target.value),
                  })
                }
                className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 mnx-num"
              />
            </FormField>

            <FormField
              id="network-edit-withdrawal-period"
              label={t("network_edit_withdrawal_period_label")}
              icon={Calendar}
              suffix="d"
            >
              <input
                id="network-edit-withdrawal-period"
                type="number"
                min={0}
                placeholder={t("network_edit_withdrawal_period_placeholder")}
                value={network?.withdrawalPeriod ?? ""}
                onChange={(e) =>
                  networkContext.setNetwork({
                    ...network,
                    withdrawalPeriod: parseInt(e.target.value),
                  })
                }
                className="flex-1 min-w-0 h-full px-2 bg-transparent border-0 outline-none text-graphite-900 placeholder:text-graphite-400 mnx-num"
              />
            </FormField>
          </div>
        </section>
      </div>

      {/* 4. Save bar (inline) -------------------------------------------- */}
      <div
        className="border-t border-mnx-neutral-200 bg-white"
        role="region"
        aria-label={t("save_button")}
      >
        <div className="max-w-container mx-auto px-shell py-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <p className="text-xs text-graphite-500 sm:flex-1">
            {t("network_edit_save_bar_hint")}
          </p>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex h-12 items-center gap-2 px-5 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t("back_button")}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={networkContext.loadingUpdate}
              className="cta-primary inline-flex h-12 items-center justify-center gap-2 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
            >
              {networkContext.loadingUpdate ? (
                t("loading")
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  {t("save_button")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
