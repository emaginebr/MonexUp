import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import AuthContext from "../../Contexts/Auth/AuthContext";

/**
 * LoginPasswordModal — vendor-branded login dialog.
 *
 * Design rationale: this modal opens on top of either VibrantTemplate
 * (cream #FFF8F2 + orange #FF6A1A + Geist) or EditorialTemplate
 * (cream #F4F1EA + terracotta + Inter). Instead of runtime branching we
 * picked a single neutral-but-warm palette that bridges both:
 *   - surface #FFF8F2 (vibrant's cream — also feels at home over editorial's #F4F1EA)
 *   - ink #1A1812 (shared by both templates verbatim)
 *   - hairline rgba(0,0,0,0.08) (matches both)
 *   - CTA #FF6A1A vibrant orange — the more confident, action-forward color;
 *     remains tasteful over editorial cream because it shares the warm hue family
 *   - Inter as a system-safe display face that doesn't fight either Geist or Fraunces
 *
 * Visual moves vs. the previous bare-bootstrap version:
 *   - Drop FontAwesome InputGroup chrome → leading 16px inline SVG glyphs inside
 *     each input, absolutely positioned, no separator squares
 *   - Hairline divider under the header, generous 28px body padding
 *   - Full-width 52px branded CTA with weight 600 + secondary inline "Cancel"
 *   - Backdrop saturated with a hint of brand (rgba(26,24,18,0.55))
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialEmail?: string;
}

export default function LoginPasswordModal({ show, onClose, onSuccess, initialEmail }: Props) {
    const { t } = useTranslation();
    const authContext = useContext(AuthContext);

    const [email, setEmail] = useState<string>(initialEmail || "");
    const [password, setPassword] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (show) {
            setEmail(initialEmail || "");
            setPassword("");
            setError("");
            setSubmitting(false);
        }
    }, [show, initialEmail]);

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const handleSubmit = async () => {
        setError("");
        if (!emailRegex.test(email)) {
            setError(t("email_invalid"));
            return;
        }
        if (!password) {
            setError(t("password_required") || "Informe a senha");
            return;
        }
        setSubmitting(true);
        const ret = await authContext.loginWithEmail(email.trim(), password);
        setSubmitting(false);
        if (!ret.sucesso) {
            setError(ret.mensagemErro || t("storefront_action_error"));
            return;
        }
        onSuccess();
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            dialogClassName="vendor-login-modal"
            contentClassName="vlm-content"
            backdropClassName="vlm-backdrop"
        >
            <style dangerouslySetInnerHTML={{ __html: vendorLoginCss }} />

            <div className="vlm-shell">
                <header className="vlm-header">
                    <h2 className="vlm-title">{t("sign_in") || "Entrar"}</h2>
                    <button
                        type="button"
                        className="vlm-close"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label={t("close") || "Close"}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </header>

                <form
                    className="vlm-body"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    noValidate
                >
                    <label className="vlm-field">
                        <span className="vlm-label">{t("field_email")}</span>
                        <span className="vlm-input-wrap">
                            <span className="vlm-input-ico" aria-hidden="true">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="m3 7 9 6 9-6" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                className="vlm-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={submitting}
                                autoFocus
                                autoComplete="email"
                            />
                        </span>
                    </label>

                    <label className="vlm-field">
                        <span className="vlm-label">{t("login_password_label") || "Senha"}</span>
                        <span className="vlm-input-wrap">
                            <span className="vlm-input-ico" aria-hidden="true">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="4" y="11" width="16" height="10" rx="2" />
                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                                </svg>
                            </span>
                            <input
                                type="password"
                                className="vlm-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={submitting}
                                autoComplete="current-password"
                            />
                        </span>
                    </label>

                    {error && (
                        <div className="vlm-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="vlm-cta"
                        disabled={submitting}
                    >
                        {submitting ? t("loading") : t("sign_in") || "Entrar"}
                    </button>

                    <button
                        type="button"
                        className="vlm-secondary"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        {t("cancel") || "Cancelar"}
                    </button>
                </form>
            </div>
        </Modal>
    );
}

/* ============================================================================
   Scoped CSS — every selector targets the modal's own dialog/content classes,
   so styles never leak into either vendor template or the rest of the app.
   ============================================================================ */
const vendorLoginCss = `
.vlm-backdrop.show { opacity: 1; background: rgba(26, 24, 18, 0.55); }

.vendor-login-modal { max-width: 440px; }
.vendor-login-modal .vlm-content {
  --vlm-surface:   #FFF8F2;
  --vlm-ink:       #1A1812;
  --vlm-ink-soft:  #5A574F;
  --vlm-ink-mute:  #8E8A7E;
  --vlm-line:      rgba(0, 0, 0, 0.08);
  --vlm-line-2:    rgba(0, 0, 0, 0.12);
  --vlm-brand:     #FF6A1A;
  --vlm-brand-ink: #C44A0A;
  --vlm-danger:    #B42318;
  --vlm-danger-bg: #FEF3F2;

  background: var(--vlm-surface);
  border: 1px solid var(--vlm-line);
  border-radius: 14px;
  box-shadow: 0 24px 60px -20px rgba(26, 24, 18, 0.35);
  overflow: hidden;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--vlm-ink);
}
.vendor-login-modal .vlm-content *,
.vendor-login-modal .vlm-content *::before,
.vendor-login-modal .vlm-content *::after { box-sizing: border-box; }

.vendor-login-modal .vlm-shell { display: flex; flex-direction: column; }

.vendor-login-modal .vlm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px 18px;
  border-bottom: 1px solid var(--vlm-line);
}
.vendor-login-modal .vlm-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--vlm-ink);
}
.vendor-login-modal .vlm-close {
  appearance: none;
  background: transparent;
  border: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: var(--vlm-ink-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.vendor-login-modal .vlm-close:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  color: var(--vlm-ink);
}
.vendor-login-modal .vlm-close:focus-visible {
  outline: 2px solid var(--vlm-brand);
  outline-offset: 2px;
}
.vendor-login-modal .vlm-close:disabled { opacity: .5; cursor: not-allowed; }

.vendor-login-modal .vlm-body {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vendor-login-modal .vlm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.vendor-login-modal .vlm-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vlm-ink-soft);
}

.vendor-login-modal .vlm-input-wrap {
  position: relative;
  display: block;
}
.vendor-login-modal .vlm-input-ico {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: var(--vlm-ink-mute);
  display: inline-flex;
  pointer-events: none;
  transition: color .15s ease;
}
.vendor-login-modal .vlm-input {
  width: 100%;
  height: 48px;
  padding: 0 14px 0 40px;
  border-radius: 10px;
  border: 1px solid var(--vlm-line-2);
  background: #FFFFFF;
  font-family: inherit;
  font-size: 14px;
  color: var(--vlm-ink);
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.vendor-login-modal .vlm-input::placeholder { color: var(--vlm-ink-mute); }
.vendor-login-modal .vlm-input:hover:not(:disabled) {
  border-color: rgba(0, 0, 0, 0.2);
}
.vendor-login-modal .vlm-input:focus {
  border-color: var(--vlm-brand);
  box-shadow: 0 0 0 3px rgba(255, 106, 26, 0.18);
}
.vendor-login-modal .vlm-input:focus + .vlm-input-ico,
.vendor-login-modal .vlm-input-wrap:focus-within .vlm-input-ico {
  color: var(--vlm-brand);
}
.vendor-login-modal .vlm-input:disabled {
  background: rgba(0, 0, 0, 0.04);
  color: var(--vlm-ink-soft);
  cursor: not-allowed;
}

.vendor-login-modal .vlm-error {
  margin: 2px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--vlm-danger-bg);
  border: 1px solid rgba(180, 35, 24, 0.18);
  color: var(--vlm-danger);
  font-size: 13px;
  line-height: 1.45;
}

.vendor-login-modal .vlm-cta {
  margin-top: 8px;
  width: 100%;
  height: 52px;
  padding: 0 20px;
  border: 0;
  border-radius: 12px;
  background: var(--vlm-brand);
  color: #FFFFFF;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.005em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px -10px rgba(255, 106, 26, 0.55);
  transition: background-color .15s ease, transform .12s ease, box-shadow .15s ease;
}
.vendor-login-modal .vlm-cta:hover:not(:disabled) {
  background: var(--vlm-brand-ink);
  box-shadow: 0 14px 28px -10px rgba(255, 106, 26, 0.65);
}
.vendor-login-modal .vlm-cta:active:not(:disabled) { transform: translateY(1px); }
.vendor-login-modal .vlm-cta:focus-visible {
  outline: 2px solid var(--vlm-brand);
  outline-offset: 3px;
}
.vendor-login-modal .vlm-cta:disabled { opacity: .6; cursor: not-allowed; box-shadow: none; }

.vendor-login-modal .vlm-secondary {
  appearance: none;
  background: transparent;
  border: 0;
  padding: 6px 8px;
  margin: 2px auto 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--vlm-ink-soft);
  cursor: pointer;
  border-radius: 8px;
  transition: color .15s ease, background-color .15s ease;
}
.vendor-login-modal .vlm-secondary:hover:not(:disabled) {
  color: var(--vlm-ink);
  background: rgba(0, 0, 0, 0.04);
}
.vendor-login-modal .vlm-secondary:focus-visible {
  outline: 2px solid var(--vlm-brand);
  outline-offset: 2px;
}
.vendor-login-modal .vlm-secondary:disabled { opacity: .5; cursor: not-allowed; }
`;
