import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterForm } from "nauth-react";
import type { UserInfo } from "nauth-react";
import { useTranslation } from "react-i18next";
import Footer from "../HomePage/Footer";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";

const registerFormStyles = {
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

export default function NewAccountPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const handleSuccess = (_user: UserInfo) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(t("userPage.registrationSuccess") || "Account created successfully");
        setShowMessage(true);
        setTimeout(() => navigate("/account/login"), 2000);
    };

    const handleError = (error: Error) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(error.message);
        setShowMessage(true);
    };

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />
            <main
                id="new-account-main"
                className="mnx-surface-dark relative overflow-hidden bg-mesh-auth"
                aria-labelledby="new-account-heading"
            >
                <div
                    className="auth-grid absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative max-w-container mx-auto px-shell py-16 lg:py-24">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                        <section className="lg:col-span-12">
                            <div className="relative max-w-md mx-auto lg:ml-auto lg:mr-0">
                                <div
                                    className="absolute -inset-6 bg-orange-500/15 rounded-3xl blur-3xl pointer-events-none"
                                    aria-hidden="true"
                                />

                                <article
                                    className="auth-card relative p-8 sm:p-10 animate-fade-up"
                                    aria-label={t("login_create_account_button")}
                                >
                                    <div>
                                        <RegisterForm
                                            onSuccess={handleSuccess}
                                            onError={handleError}
                                            steps={["basic"]}
                                            showProgressBar={false}
                                            styles={registerFormStyles}
                                        />
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-neutral-200 text-center text-sm text-graphite-500">
                                        {t("register_already_have_account") || "Already have an account?"}
                                        <Link
                                            to="/account/login"
                                            className="ml-1 font-semibold text-orange-700 hover:text-orange-600 transition-colors duration-fast"
                                        >
                                            {t("login_button") || "Sign In"}
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
