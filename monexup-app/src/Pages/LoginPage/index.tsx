import { useContext, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginForm } from "nauth-react";
import type { UserInfo } from "nauth-react";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import NetworkContext from "../../Contexts/Network/NetworkContext";

const loginFormStyles = {
    container: "space-y-5",
    input:
        "block w-full h-12 px-3.5 rounded-md border border-neutral-300 bg-white " +
        "text-graphite-900 placeholder:text-graphite-400 " +
        "hover:border-graphite-400 " +
        "focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20 focus:outline-none " +
        "transition-colors duration-fast",
    button:
        "cta-primary inline-flex items-center justify-center w-full h-12 px-5 rounded-md " +
        "bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md " +
        "transition-colors duration-fast",
};

export default function LoginPage() {
    const { t } = useTranslation();

    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const throwError = (message: string) => {
        setMessageText(message);
        setShowMessage(true);
    };

    const networkContext = useContext(NetworkContext);

    const navigate = useNavigate();
    const [queryParams] = useSearchParams();

    const getReturnUrl = () => {
        if (queryParams.has("returnUrl")) {
            return queryParams.get("returnUrl");
        }
        return "/";
    };

    const handleLoginSuccess = async (user: UserInfo) => {
        try {
            const netRet = await networkContext.listByUser();
            if (netRet.sucesso) {
                navigate(getReturnUrl());
            } else {
                throwError(netRet.mensagemErro);
            }
        } catch (err: any) {
            throwError(err?.message || "Failed to load networks");
        }
    };

    const handleLoginError = (error: Error) => {
        throwError(error.message);
    };

    return (
        <>
            <MessageToast
                dialog={MessageToastEnum.Error}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />
            <Header />

            <main
                id="login-main"
                className="mnx-surface-dark relative overflow-hidden bg-mesh-auth"
                aria-labelledby="login-heading"
            >
                <div
                    className="auth-grid absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative max-w-container mx-auto px-shell py-16 lg:py-24">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                        {/* LEFT — editorial copy column */}
                        <section className="lg:col-span-6 order-2 lg:order-1 animate-fade-up">
                            <span className="trust-chip">
                                <span className="dot" aria-hidden="true" />
                                {t("home_hero_eyebrow")}
                            </span>
                            <h1
                                id="login-heading"
                                className="display-headline text-mnx-neutral-50 mt-6 text-4xl sm:text-5xl lg:text-6xl"
                            >
                                {t("login_title")}
                                <span className="text-orange-500">.</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-graphite-200 text-base lg:text-lg leading-relaxed">
                                {t("login_instruction")}
                            </p>
                        </section>

                        {/* RIGHT — login card */}
                        <section className="lg:col-span-6 order-1 lg:order-2">
                            <div className="relative max-w-md mx-auto lg:ml-auto lg:mr-0">
                                <div
                                    className="absolute -inset-6 bg-orange-500/15 rounded-3xl blur-3xl pointer-events-none"
                                    aria-hidden="true"
                                />

                                <article
                                    className="auth-card relative p-8 sm:p-10 animate-fade-up"
                                    aria-label={t("login_title")}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="auth-mark" aria-hidden="true">
                                            M.
                                        </div>
                                        <h2 className="display-headline mt-6 text-3xl text-graphite-900">
                                            {t("login_title")}
                                        </h2>
                                        <p className="mt-3 text-graphite-500 text-sm leading-relaxed">
                                            {t("login_instruction")}
                                        </p>
                                    </div>

                                    <div className="mt-8">
                                        <LoginForm
                                            onSuccess={handleLoginSuccess}
                                            onError={handleLoginError}
                                            showRememberMe={true}
                                            styles={loginFormStyles}
                                        />
                                    </div>

                                    <div className="mt-4 flex justify-center">
                                        <Link
                                            to="/account/recovery-password"
                                            className="text-sm font-medium text-orange-700 hover:text-orange-600 transition-colors duration-fast"
                                        >
                                            {t("login_recovery_password") || "Recovery Password?"}
                                        </Link>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-neutral-200 text-center text-sm text-graphite-500">
                                        {t("login_no_account") || "Don't have an account?"}
                                        <Link
                                            to="/account/new-account"
                                            className="ml-1 font-semibold text-orange-700 hover:text-orange-600 transition-colors duration-fast"
                                        >
                                            {t("login_create_account_button")}
                                        </Link>
                                    </div>
                                </article>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
