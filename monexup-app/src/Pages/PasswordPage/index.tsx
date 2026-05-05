import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, Save } from "lucide-react";
import { ChangePasswordForm } from "nauth-react";

import AuthContext from "../../Contexts/Auth/AuthContext";
import MessageToast from "../../Components/MessageToast";
import { Skeleton } from "../../Components/ui/skeleton";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";

/**
 * PasswordPage — redesigned `/account/change-password` route.
 *
 * Visual contract: matches the redesigned ProfileEditPage / EditAccountPage
 * (compact page header with 2px orange accent bar + `display-headline` +
 * breadcrumb in the `ml-[14px]` slot, single `auth-card` body, no sticky
 * save bar). The route currently sits under the `Layout` shell (HomeHeader
 * only — no AdminSidebar). The shell mismatch with the AdminSidebar entry
 * is intentional for now and is NOT addressed here.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - delegates the actual change to nauth-react's `ChangePasswordForm`
 *   - success / error are routed through the existing `MessageToast`
 *   - no navigation on success (matches legacy)
 *
 * UX wiring: nauth's `ChangePasswordForm` renders its own `<form>` and
 * submit button. We hide that inline button via
 * `[&_form_button[type=submit]]:hidden` (the orange skin still applies via
 * `nauth-overrides.scss` — but the button is invisible). The header
 * `Salvar` button locates the rendered `<form>` via the wrapper ref and
 * triggers `requestSubmit()` so native HTML5 validation + RHF resolver
 * still fire inside `ChangePasswordForm`.
 */
export default function PasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const authContext = useContext(AuthContext);

  const formWrapperRef = useRef<HTMLDivElement | null>(null);

  const [saving, setSaving] = useState<boolean>(false);

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  // Until the auth session resolves, render skeleton rows so the user
  // never sees a flash of empty fields. This mirrors EditAccountPage.
  const isLoading = !authContext.sessionInfo;

  // Reset the saving flag whenever a toast surfaces — covers both branches
  // (onSuccess / onError) once nauth's submit promise has resolved.
  useEffect(() => {
    if (showMessage) setSaving(false);
  }, [showMessage]);

  const handleSuccess = () => {
    setDialog(MessageToastEnum.Success);
    setMessageText(
      t("password_page_change_success") || "Password changed successfully",
    );
    setShowMessage(true);
  };

  const handleError = (error: Error) => {
    setDialog(MessageToastEnum.Error);
    setMessageText(error.message);
    setShowMessage(true);
  };

  const handleHeaderSave = () => {
    const formEl = formWrapperRef.current?.querySelector("form");
    if (!formEl) return;
    setSaving(true);
    // requestSubmit fires the form's native submit event, so RHF /
    // resolver validation still runs inside ChangePasswordForm.
    formEl.requestSubmit();
  };

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={dialog}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />

      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band (ProfileEditPage / EditAccountPage parity) -- */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="password-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="password-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight truncate max-w-[18rem] sm:max-w-[26rem] lg:max-w-[32rem]"
              >
                {t("change_password")}
              </h1>
            </div>
            <nav aria-label="Breadcrumb" className="mt-2 ml-[14px] text-sm">
              <ol className="flex items-center gap-1 text-graphite-500">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-orange-600 transition-colors duration-fast"
                  >
                    {t("footer_dashboard")}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-graphite-300">
                  <ChevronRight size={14} />
                </li>
                <li
                  aria-current="page"
                  className="font-medium text-graphite-700 truncate max-w-[14rem]"
                >
                  {t("change_password")}
                </li>
              </ol>
            </nav>
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
            <button
              type="button"
              onClick={handleHeaderSave}
              disabled={saving || isLoading}
              className="cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
            >
              {saving ? (
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

        {/* 2. Form card --------------------------------------------------- */}
        <section
          aria-label={t("change_password")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {isLoading ? (
            <div className="space-y-5" aria-busy="true">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : (
            // The wrapper hides nauth's inline submit; the header `Salvar`
            // button drives form submission via `requestSubmit()` on the
            // rendered <form> located through the ref.
            <div
              ref={formWrapperRef}
              className="[&_form_button[type=submit]]:hidden"
            >
              <ChangePasswordForm
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
