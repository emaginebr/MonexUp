import { useContext, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginForm } from "nauth-react";
import type { UserInfo } from "nauth-react";
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
        return "/admin/dashboard";
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
                        {/* RIGHT — login card */}
                        <section className="lg:col-span-12">
                            <div className="relative max-w-md mx-auto lg:ml-auto lg:mr-0">
                                <div
                                    className="absolute -inset-6 bg-orange-500/15 rounded-3xl blur-3xl pointer-events-none"
                                    aria-hidden="true"
                                />

                                <article
                                    className="auth-card relative p-8 sm:p-10 animate-fade-up"
                                    aria-label={t("login_title")}
                                >
                                    <div>
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
