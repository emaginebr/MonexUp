import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    User as UserIcon,
    Mail,
    Lock,
    Globe2,
    CreditCard,
    Percent,
    Check,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    LogIn,
    UserPlus,
    Code,
} from "lucide-react";
import Footer from "../HomePage/Footer";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import AuthContext from "../../Contexts/Auth/AuthContext";
import UserContext from "../../Contexts/User/UserContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import NetworkInsertInfo from "../../DTO/Domain/NetworkInsertInfo";

const WIZARD_STEPS = [
    { key: 1, Icon: UserIcon, labelKey: "network_insert_step_register_user" },
    { key: 2, Icon: Globe2, labelKey: "network_insert_step_register_network" },
    { key: 3, Icon: CreditCard, labelKey: "network_insert_step_payment" },
    { key: 4, Icon: Check, labelKey: "network_insert_step_done" },
] as const;

const authInputClass =
    "block w-full h-12 px-3.5 rounded-md border border-neutral-300 bg-white " +
    "text-graphite-900 placeholder:text-graphite-400 " +
    "hover:border-graphite-400 " +
    "focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20 focus:outline-none " +
    "transition-colors duration-fast";

const authLabelClass = "block text-sm font-medium text-graphite-700 mb-1.5";

function toNetworkSlug(value: string): string {
    return (value || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

export default function NetworkInsertPage() {
    const { t } = useTranslation();

    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);

    const [step, setStep] = useState<number>(1);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [networkName, setNetworkName] = useState<string>("");
    const [networkEmail, setNetworkEmail] = useState<string>(authContext.sessionInfo?.email ?? "");
    const [networkCommission, setNetworkCommission] = useState<number>(0);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const headingRef = useRef<HTMLHeadingElement | null>(null);

    const navigate = useNavigate();

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
        if (authContext.sessionInfo) {
            if (authContext.sessionInfo?.userId > 0) {
                setStep(2);
            } else {
                setStep(1);
            }
        } else {
            setStep(1);
        }
    }, []);

    useEffect(() => {
        headingRef.current?.focus({ preventScroll: false });
    }, [step]);

    const slug = toNetworkSlug(networkName) || "sua-rede";

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />

            <main
                id="network-main"
                className="mnx-surface-dark relative overflow-hidden bg-mesh-auth"
                aria-labelledby="network-heading"
            >
                <div className="auth-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

                <div className="relative max-w-container mx-auto px-shell pt-12 lg:pt-16 pb-6 lg:pb-10">
                    <div className="text-center max-w-2xl mx-auto animate-fade-up">
                        <span className="trust-chip">
                            <span className="dot" aria-hidden="true" />
                            {t("network_insert_hero_eyebrow")}
                        </span>
                        <h1
                            id="network-heading"
                            ref={headingRef}
                            tabIndex={-1}
                            className="display-headline text-mnx-neutral-50 mt-5 text-3xl sm:text-4xl lg:text-5xl outline-none"
                        >
                            {t("network_insert_hero_title_1")}
                            <br />
                            <span className="text-orange-500">
                                {t("network_insert_hero_title_2")}
                            </span>
                        </h1>
                        <p className="mt-4 text-graphite-200 text-base lg:text-lg leading-relaxed max-w-xl mx-auto">
                            {t("network_insert_hero_subtitle")}
                        </p>
                    </div>

                    <ol
                        className="mnx-wizard mt-10 lg:mt-12"
                        aria-label={t("network_insert_hero_eyebrow")}
                    >
                        {WIZARD_STEPS.map((s) => {
                            const isActive = step === s.key;
                            const isCompleted = step > s.key;
                            const stateClass = isActive
                                ? " is-active"
                                : isCompleted
                                ? " is-completed"
                                : "";
                            const Icon = s.Icon;
                            return (
                                <li
                                    key={s.key}
                                    className={`mnx-wizard__step${stateClass}`}
                                    aria-current={isActive ? "step" : undefined}
                                >
                                    <span className="mnx-wizard__circle" aria-hidden="true">
                                        {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                                    </span>
                                    <span className="mnx-wizard__label">{t(s.labelKey)}</span>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                {step === 1 && (
                    <section
                        aria-labelledby="step-1-label"
                        className="relative max-w-container mx-auto px-shell pb-16 lg:pb-24 auth-form-preview"
                    >
                        <h2 id="step-1-label" className="sr-only">
                            {t("network_insert_step_register_user")}
                        </h2>

                        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                            <div className="lg:col-span-5 order-2 lg:order-1 animate-fade-up text-graphite-200">
                                <p className="text-sm uppercase tracking-wider text-orange-300 font-semibold">
                                    {t("network_insert_step_register_user")}
                                </p>
                                <h3 className="display-headline mt-4 text-2xl sm:text-3xl text-white">
                                    {t("network_insert_user_registration_title")}
                                </h3>
                                <p className="mt-4 text-base lg:text-lg leading-relaxed">
                                    {t("network_edit_registration_info")}
                                </p>
                            </div>

                            <div className="lg:col-span-7 order-1 lg:order-2">
                                <div className="relative w-full max-w-xl mx-auto lg:ml-auto lg:mr-0">
                                    <div
                                        className="absolute -inset-6 bg-orange-500/15 rounded-3xl blur-3xl pointer-events-none"
                                        aria-hidden="true"
                                    />

                                    <article className="auth-card relative p-6 sm:p-8 lg:p-10 animate-fade-up">
                                        <div
                                            role="tablist"
                                            aria-label={t("network_insert_step_register_user")}
                                            className="seg"
                                        >
                                            <button
                                                type="button"
                                                role="tab"
                                                id="tab-login"
                                                aria-controls="panel-login"
                                                aria-selected={authMode === "login"}
                                                onClick={() => setAuthMode("login")}
                                                className={`seg__btn ${authMode === "login" ? "is-active" : ""}`}
                                            >
                                                <LogIn size={14} aria-hidden="true" /> {t("login_title")}
                                            </button>
                                            <button
                                                type="button"
                                                role="tab"
                                                id="tab-register"
                                                aria-controls="panel-register"
                                                aria-selected={authMode === "register"}
                                                onClick={() => setAuthMode("register")}
                                                className={`seg__btn ${authMode === "register" ? "is-active" : ""}`}
                                            >
                                                <UserPlus size={14} aria-hidden="true" />{" "}
                                                {t("network_insert_user_registration_title")}
                                            </button>
                                        </div>

                                        <div
                                            id="panel-login"
                                            role="tabpanel"
                                            aria-labelledby="tab-login"
                                            hidden={authMode !== "login"}
                                            className="mt-6"
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <label
                                                        htmlFor="login-email"
                                                        className={authLabelClass}
                                                    >
                                                        <Mail
                                                            size={14}
                                                            className="inline mr-1.5 text-graphite-500"
                                                        />
                                                        {t("login_email_label")}
                                                    </label>
                                                    <input
                                                        id="login-email"
                                                        type="email"
                                                        autoComplete="email"
                                                        className={authInputClass}
                                                        placeholder={t("login_email_placeholder")}
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="login-password"
                                                        className={authLabelClass}
                                                    >
                                                        <Lock
                                                            size={14}
                                                            className="inline mr-1.5 text-graphite-500"
                                                        />
                                                        {t("login_password_label")}
                                                    </label>
                                                    <input
                                                        id="login-password"
                                                        type="password"
                                                        autoComplete="current-password"
                                                        className={authInputClass}
                                                        placeholder={t("login_password_placeholder")}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between flex-wrap gap-3">
                                                    <label className="inline-flex items-center gap-2 text-sm text-graphite-700">
                                                        <input
                                                            type="checkbox"
                                                            className="field-checkbox"
                                                        />
                                                        {t("login_remember_password_label")}
                                                    </label>
                                                    <Link
                                                        to="/account/recovery-password"
                                                        className="text-sm font-medium text-orange-700 hover:text-orange-600 transition-colors duration-fast"
                                                    >
                                                        {t("login_recovery_password_button")}
                                                    </Link>
                                                </div>
                                                <div className="pt-2 flex justify-end">
                                                    <button
                                                        type="button"
                                                        disabled={authContext.loading}
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            if (!email) {
                                                                throwError(t("login_error_email_empty"));
                                                                return;
                                                            }
                                                            if (!password) {
                                                                throwError(
                                                                    t("login_error_password_empty"),
                                                                );
                                                                return;
                                                            }
                                                            const ret = await authContext.loginWithEmail(
                                                                email,
                                                                password,
                                                            );
                                                            if (ret.sucesso) {
                                                                const netRet =
                                                                    await networkContext.listByUser();
                                                                if (netRet.sucesso) {
                                                                    setStep(2);
                                                                } else {
                                                                    throwError(netRet.mensagemErro);
                                                                }
                                                            } else {
                                                                throwError(ret.mensagemErro);
                                                            }
                                                        }}
                                                        className="cta-primary inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {authContext.loading
                                                            ? t("loading")
                                                            : t("next_button")}
                                                        <ArrowRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            id="panel-register"
                                            role="tabpanel"
                                            aria-labelledby="tab-register"
                                            hidden={authMode !== "register"}
                                            className="mt-6"
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <label
                                                        htmlFor="reg-name"
                                                        className={authLabelClass}
                                                    >
                                                        <UserIcon
                                                            size={14}
                                                            className="inline mr-1.5 text-graphite-500"
                                                        />
                                                        {t("form_label_name")}
                                                    </label>
                                                    <input
                                                        id="reg-name"
                                                        type="text"
                                                        autoComplete="name"
                                                        className={authInputClass}
                                                        placeholder={t("form_placeholder_your_name")}
                                                        value={userContext.user?.name ?? ""}
                                                        onChange={(e) =>
                                                            userContext.setUser({
                                                                ...userContext.user,
                                                                name: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="reg-email"
                                                        className={authLabelClass}
                                                    >
                                                        <Mail
                                                            size={14}
                                                            className="inline mr-1.5 text-graphite-500"
                                                        />
                                                        {t("form_label_email")}
                                                    </label>
                                                    <input
                                                        id="reg-email"
                                                        type="email"
                                                        autoComplete="email"
                                                        className={authInputClass}
                                                        placeholder={t("form_placeholder_your_email")}
                                                        value={userContext.user?.email ?? ""}
                                                        onChange={(e) =>
                                                            userContext.setUser({
                                                                ...userContext.user,
                                                                email: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="reg-password"
                                                        className={authLabelClass}
                                                    >
                                                        <Lock
                                                            size={14}
                                                            className="inline mr-1.5 text-graphite-500"
                                                        />
                                                        {t("form_label_password")}
                                                    </label>
                                                    <input
                                                        id="reg-password"
                                                        type="password"
                                                        autoComplete="new-password"
                                                        className={authInputClass}
                                                        placeholder={t("form_placeholder_your_password")}
                                                        value={userContext.user?.password ?? ""}
                                                        onChange={(e) =>
                                                            userContext.setUser({
                                                                ...userContext.user,
                                                                password: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="reg-confirm"
                                                        className={authLabelClass}
                                                    >
                                                        <Lock
                                                            size={14}
                                                            className="inline mr-1.5 text-graphite-500"
                                                        />
                                                        {t("form_label_confirm_password")}
                                                    </label>
                                                    <input
                                                        id="reg-confirm"
                                                        type="password"
                                                        autoComplete="new-password"
                                                        className={authInputClass}
                                                        placeholder={t(
                                                            "form_placeholder_confirm_your_password",
                                                        )}
                                                        value={confirmPassword}
                                                        onChange={(e) =>
                                                            setConfirmPassword(e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="pt-2 flex justify-end">
                                                    <button
                                                        type="button"
                                                        disabled={userContext.loadingUpdate}
                                                        onClick={async () => {
                                                            if (!userContext.user?.name) {
                                                                throwError(t("error_name_empty"));
                                                                return;
                                                            }
                                                            if (!userContext.user?.email) {
                                                                throwError(t("error_email_empty"));
                                                                return;
                                                            }
                                                            if (
                                                                userContext.user?.password !==
                                                                confirmPassword
                                                            ) {
                                                                throwError(
                                                                    t(
                                                                        "error_password_confirmation_different",
                                                                    ),
                                                                );
                                                                return;
                                                            }
                                                            const ret = await userContext.insert(
                                                                userContext.user,
                                                            );
                                                            if (ret.sucesso) {
                                                                showSuccessMessage(ret.mensagemSucesso);
                                                                setStep(2);
                                                            } else {
                                                                throwError(ret.mensagemErro);
                                                            }
                                                        }}
                                                        className="cta-primary inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {userContext.loadingUpdate
                                                            ? t("loading")
                                                            : t("next_button")}
                                                        <ArrowRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section
                        aria-labelledby="step-2-label"
                        className="relative max-w-container mx-auto px-shell pb-16 lg:pb-24 auth-form-preview"
                    >
                        <h2 id="step-2-label" className="sr-only">
                            {t("network_insert_step_register_network")}
                        </h2>

                        <div className="flex justify-center">
                            <div className="relative w-full max-w-2xl">
                                <div
                                    className="absolute -inset-6 bg-orange-500/15 rounded-3xl blur-3xl pointer-events-none"
                                    aria-hidden="true"
                                />

                                <article className="auth-card relative p-6 sm:p-8 lg:p-10 animate-fade-up">
                                    <div className="text-center">
                                        <div className="auth-mark mx-auto" aria-hidden="true">
                                            <Globe2 size={22} />
                                        </div>
                                        <h3 className="display-headline mt-6 text-2xl text-graphite-900">
                                            {t("network_insert_network_registration_title")}
                                        </h3>
                                        <p className="mt-2 text-sm text-graphite-500 max-w-md mx-auto">
                                            {t("network_edit_registration_info")}
                                        </p>
                                    </div>

                                    <div className="mt-8 space-y-5">
                                        <div>
                                            <label htmlFor="net-name" className={authLabelClass}>
                                                {t("form_label_name")}
                                            </label>
                                            <input
                                                id="net-name"
                                                type="text"
                                                className={authInputClass}
                                                placeholder={t("network_edit_name_placeholder")}
                                                value={networkName}
                                                onChange={(e) => setNetworkName(e.target.value)}
                                            />
                                            <div className="mt-2" aria-live="polite">
                                                <span className="slug-preview">
                                                    <span className="slug-preview__icon" aria-hidden="true">
                                                        <Code size={12} />
                                                    </span>
                                                    <span className="text-[0.7rem] uppercase tracking-wider font-sans font-semibold mr-1">
                                                        URL
                                                    </span>
                                                    monexup.com/<span className="font-bold">{slug}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="net-email" className={authLabelClass}>
                                                {t("form_label_email")}
                                            </label>
                                            <input
                                                id="net-email"
                                                type="email"
                                                autoComplete="email"
                                                className={authInputClass}
                                                placeholder={t("network_insert_network_email_placeholder")}
                                                value={networkEmail}
                                                onChange={(e) => setNetworkEmail(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="net-commission" className={authLabelClass}>
                                                <Percent size={14} className="inline mr-1.5 text-graphite-500" />
                                                {t("network_edit_commission_label")}
                                            </label>
                                            <div className="field-affix max-w-[12rem]">
                                                <input
                                                    id="net-commission"
                                                    type="number"
                                                    inputMode="decimal"
                                                    min={0}
                                                    max={100}
                                                    step={0.5}
                                                    className={`${authInputClass} pr-10`}
                                                    placeholder={t("network_edit_commission_placeholder")}
                                                    value={networkCommission}
                                                    onChange={(e) =>
                                                        setNetworkCommission(parseFloat(e.target.value))
                                                    }
                                                />
                                                <span className="field-affix__suffix">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex flex-row justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-md border border-neutral-300 bg-white text-graphite-900 font-medium hover:bg-neutral-100 transition-colors duration-fast"
                                        >
                                            <ArrowLeft size={16} /> {t("back_button")}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={networkContext.loadingUpdate}
                                            onClick={async () => {
                                                let networkInsert: NetworkInsertInfo;
                                                const ret = await networkContext.insert({
                                                    ...networkInsert,
                                                    name: networkName,
                                                    email: networkEmail,
                                                    comission: networkCommission,
                                                    plan: 1,
                                                });
                                                if (ret.sucesso) {
                                                    showSuccessMessage(ret.mensagemSucesso);
                                                    setStep(4);
                                                    const retUsers = await networkContext.listByUser();
                                                    if (!retUsers.sucesso) {
                                                        throwError(retUsers.mensagemErro);
                                                    }
                                                } else {
                                                    throwError(ret.mensagemErro);
                                                }
                                            }}
                                            className="cta-primary inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {networkContext.loadingUpdate
                                                ? t("loading")
                                                : (
                                                    <>
                                                        {t("next_button")} <ArrowRight size={16} />
                                                    </>
                                                )}
                                        </button>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </section>
                )}

                {step === 3 && (
                    <section
                        aria-labelledby="step-3-label"
                        className="relative max-w-container mx-auto px-shell pb-16 lg:pb-24"
                    >
                        <h2 id="step-3-label" className="sr-only">
                            {t("network_insert_step_payment")}
                        </h2>

                        <div className="flex justify-center">
                            <div className="relative w-full max-w-2xl">
                                <article className="auth-card relative p-6 sm:p-8 lg:p-10 text-center animate-fade-up">
                                    <div className="auth-mark mx-auto" aria-hidden="true">
                                        <CreditCard size={22} />
                                    </div>
                                    <h3 className="display-headline mt-6 text-2xl text-graphite-900">
                                        {t("network_insert_step_payment")}
                                    </h3>
                                    <p className="mt-3 text-sm text-graphite-500 max-w-md mx-auto">
                                        Em breve
                                    </p>
                                    <div className="pt-6 flex justify-center">
                                        <button
                                            type="button"
                                            disabled
                                            aria-disabled="true"
                                            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-neutral-200 text-graphite-400 font-semibold cursor-not-allowed"
                                        >
                                            {t("next_button")} <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </section>
                )}

                {step === 4 && (
                    <section
                        aria-labelledby="step-4-label"
                        className="relative max-w-container mx-auto px-shell pb-16 lg:pb-24"
                    >
                        <h2 id="step-4-label" className="sr-only">
                            {t("network_insert_step_done")}
                        </h2>

                        <div className="flex justify-center">
                            <div className="relative w-full max-w-2xl">
                                <article className="auth-card relative overflow-hidden p-8 sm:p-10 lg:p-12 text-center animate-fade-up">
                                    <span className="success-halo mx-auto" role="img" aria-label="Sucesso">
                                        <CheckCircle2 size={44} />
                                    </span>
                                    <h3 className="display-headline mt-8 text-3xl sm:text-4xl text-graphite-900">
                                        {t("network_insert_success_title")}
                                    </h3>
                                    <p className="mt-5 text-graphite-700 leading-relaxed max-w-lg mx-auto">
                                        {t("network_insert_success_message_1")}
                                    </p>
                                    <ul className="mt-5 max-w-lg mx-auto text-left space-y-2 text-graphite-700">
                                        {t("network_insert_success_message_2")
                                            .split(/[;]\s*/)
                                            .filter((s) => s.trim().length > 0)
                                            .map((line, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <CheckCircle2
                                                        size={16}
                                                        className="text-orange-500 mt-0.5 shrink-0"
                                                    />
                                                    <span>{line.trim()}</span>
                                                </li>
                                            ))}
                                    </ul>
                                    <p className="mt-6 font-display text-lg text-graphite-900">
                                        {t("network_insert_success_lets_start")}
                                    </p>
                                    <div className="pt-6 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate("/admin/dashboard");
                                            }}
                                            className="cta-primary inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md transition-colors duration-fast"
                                        >
                                            {t("network_insert_access_my_network_button")}{" "}
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}
