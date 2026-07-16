import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../HomePage/Footer";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import UserContext from "../../Contexts/User/UserContext";
import AuthContext from "../../Contexts/Auth/AuthContext";
import UserInfo from "../../DTO/Domain/UserInfo";

const inputBase =
    "block w-full h-12 px-3.5 rounded-md border border-neutral-300 bg-white " +
    "text-graphite-900 placeholder:text-graphite-400 " +
    "hover:border-graphite-400 " +
    "focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20 focus:outline-none " +
    "transition-colors duration-fast";
const buttonBase =
    "cta-primary inline-flex items-center justify-center w-full h-12 px-5 rounded-md " +
    "bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-glow-md " +
    "transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewAccountPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userContext = useContext(UserContext);
    const authContext = useContext(AuthContext);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    const showError = (msg: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(msg);
        setShowMessage(true);
    };
    const showSuccess = (msg: string) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(msg);
        setShowMessage(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showError(t("name_required") || "Informe o nome");
            return;
        }
        if (!emailRegex.test(email)) {
            showError(t("email_invalid") || "E-mail inválido");
            return;
        }
        if (!password) {
            showError(t("password_required") || "Informe a senha");
            return;
        }
        if (password !== confirmPassword) {
            showError(t("passwords_not_equal") || "As senhas não coincidem");
            return;
        }

        // Full payload — NAuth rejects the create-user call when any of these
        // fields is missing, even when the value is empty. See ProblemDetails
        // response: Slug/Roles/Phones/PixKey/ImageUrl/Addresses/IdDocument.
        const userFull: UserInfo = {
            userId: 0,
            slug: "",
            imageUrl: "",
            name: name.trim(),
            email: email.trim(),
            hash: "",
            isAdmin: false,
            birthDate: "",
            idDocument: "",
            pixKey: "",
            password,
            roles: [],
            phones: [],
            addresses: [],
            createAt: "",
            updateAt: "",
        };

        setSubmitting(true);
        const ret = await userContext.insert(userFull);
        if (!ret.sucesso) {
            setSubmitting(false);
            showError(ret.mensagemErro || "Erro ao criar conta");
            return;
        }
        showSuccess(t("userPage.registrationSuccess") || "Conta criada com sucesso");
        // Auto-login and hand off to the admin dashboard.
        const retLogin = await authContext.loginWithEmail(email.trim(), password);
        setSubmitting(false);
        if (retLogin?.sucesso === false) {
            navigate("/account/login");
            return;
        }
        navigate("/admin/dashboard");
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
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="register-name" className="block text-xs font-semibold uppercase tracking-wider text-graphite-500 mb-1.5">
                                                {t("field_name") || "Nome"}
                                            </label>
                                            <input
                                                id="register-name"
                                                type="text"
                                                className={inputBase}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                autoFocus
                                                autoComplete="name"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="register-email" className="block text-xs font-semibold uppercase tracking-wider text-graphite-500 mb-1.5">
                                                {t("field_email") || "E-mail"}
                                            </label>
                                            <input
                                                id="register-email"
                                                type="email"
                                                className={inputBase}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoComplete="email"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="register-password" className="block text-xs font-semibold uppercase tracking-wider text-graphite-500 mb-1.5">
                                                {t("login_password_label") || "Senha"}
                                            </label>
                                            <input
                                                id="register-password"
                                                type="password"
                                                className={inputBase}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="register-confirm" className="block text-xs font-semibold uppercase tracking-wider text-graphite-500 mb-1.5">
                                                {t("password_confirm") || "Confirmar senha"}
                                            </label>
                                            <input
                                                id="register-confirm"
                                                type="password"
                                                className={inputBase}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <button type="submit" disabled={submitting} className={buttonBase}>
                                            {submitting ? (t("loading") || "Carregando...") : (t("login_create_account_button") || "Criar conta")}
                                        </button>
                                    </form>

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
