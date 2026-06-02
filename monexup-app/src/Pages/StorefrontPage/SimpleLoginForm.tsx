import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faEnvelope,
    faIdCard,
    faPhone,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import UserContext from "../../Contexts/User/UserContext";
import AuthContext from "../../Contexts/Auth/AuthContext";
import { isValidCpf } from "../../Infra/Validators/CpfValidator";

export interface SimpleLoginResult {
    name: string;
    email: string;
    documentId: string;
    phone?: string;
}

interface SimpleLoginFormProps {
    show: boolean;
    onClose: () => void;
    onSuccess: (user: SimpleLoginResult) => void;
    onError: (msg: string) => void;
    prefill?: { name?: string; email?: string };
    skipRegister?: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const randomPassword = () => {
    const arr = new Uint8Array(12);
    if (typeof window !== "undefined" && window.crypto) {
        window.crypto.getRandomValues(arr);
    } else {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(arr).map((b) => b.toString(36)).join("") + "Aa1!";
};

export default function SimpleLoginForm({
    show,
    onClose,
    onSuccess,
    onError,
    prefill,
    skipRegister,
}: SimpleLoginFormProps) {
    const { t } = useTranslation();
    const userContext = useContext(UserContext);
    const authContext = useContext(AuthContext);

    const session = authContext?.sessionInfo;
    const isLoggedIn = Boolean(session);

    const [name, setName] = useState<string>(session?.name || prefill?.name || "");
    const [email, setEmail] = useState<string>(session?.email || prefill?.email || "");
    const [phone, setPhone] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Login sub-view state (email/password) overlayed inside same modal.
    const [showLogin, setShowLogin] = useState<boolean>(false);
    const [loginEmail, setLoginEmail] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginSubmitting, setLoginSubmitting] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<string>("");

    // Sync buyer fields with the current session whenever it changes (e.g.
    // user logs in via the embedded login subview).
    useEffect(() => {
        if (session) {
            setName(session.name || "");
            setEmail(session.email || "");
        }
    }, [session]);

    const reset = () => {
        setName(session?.name || prefill?.name || "");
        setEmail(session?.email || prefill?.email || "");
        setPhone("");
        setCpf("");
        setError("");
        setShowLogin(false);
        setLoginEmail("");
        setLoginPassword("");
        setLoginError("");
    };

    const handleClose = () => {
        if (submitting || loginSubmitting) return;
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        setError("");
        if (!name.trim()) {
            setError(t("name_required"));
            return;
        }
        if (!emailRegex.test(email)) {
            setError(t("email_invalid"));
            return;
        }
        const cpfDigits = cpf.replace(/\D/g, "");
        if (!isValidCpf(cpfDigits)) {
            setError(t("cpf_invalid"));
            return;
        }
        const phoneDigits = phone.replace(/\D/g, "");

        const result: SimpleLoginResult = {
            name: name.trim(),
            email: email.trim(),
            documentId: cpfDigits,
            phone: phoneDigits,
        };

        if (skipRegister || isLoggedIn) {
            reset();
            onSuccess(result);
            return;
        }

        setSubmitting(true);
        const password = randomPassword();
        const payload: any = {
            name: result.name,
            email: result.email,
            idDocument: cpfDigits,
            password,
            phones: phoneDigits ? [{ phone: phoneDigits }] : [],
            addresses: [],
        };
        const insertRet = await userContext.insert(payload);
        if (!insertRet.sucesso) {
            setSubmitting(false);
            const msg = insertRet.mensagemErro || t("storefront_action_error");
            setError(msg);
            onError(msg);
            return;
        }

        const loginRet = await userContext.loginWithEmail(result.email, password);
        setSubmitting(false);
        if (!loginRet.sucesso) {
            const msg = loginRet.mensagemErro || t("storefront_action_error");
            setError(msg);
            onError(msg);
            return;
        }

        reset();
        onSuccess(result);
    };

    const handleLoginSubmit = async () => {
        setLoginError("");
        if (!emailRegex.test(loginEmail)) {
            setLoginError(t("email_invalid"));
            return;
        }
        if (!loginPassword) {
            setLoginError(t("password_required") || "Informe a senha");
            return;
        }
        setLoginSubmitting(true);
        const ret = await authContext.loginWithEmail(loginEmail.trim(), loginPassword);
        setLoginSubmitting(false);
        if (!ret.sucesso) {
            setLoginError(ret.mensagemErro || t("storefront_action_error"));
            return;
        }
        // Session effect (useEffect above) syncs name/email. Close subview.
        setShowLogin(false);
        setLoginEmail("");
        setLoginPassword("");
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton={!submitting && !loginSubmitting}>
                <Modal.Title>
                    {showLogin
                        ? t("sign_in") || "Entrar"
                        : t("simple_login_title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* --- LOGIN SUBVIEW (email + password) ------------------- */}
                {showLogin ? (
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLoginSubmit();
                        }}
                    >
                        <p className="text-muted small mb-3">
                            {t("login_instruction") || "Faça login com seu email e senha."}
                        </p>
                        <Form.Group className="mb-2">
                            <Form.Label>{t("field_email")}</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faEnvelope} fixedWidth />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    disabled={loginSubmitting}
                                    autoFocus
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>{t("login_password_label") || "Senha"}</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faLock} fixedWidth />
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    disabled={loginSubmitting}
                                />
                            </InputGroup>
                        </Form.Group>
                        {loginError && (
                            <div className="alert alert-danger py-2 mb-2 small">{loginError}</div>
                        )}
                        <div className="d-grid gap-2">
                            <Button type="submit" variant="primary" disabled={loginSubmitting}>
                                {loginSubmitting ? t("loading") : t("sign_in") || "Entrar"}
                            </Button>
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={() => setShowLogin(false)}
                                disabled={loginSubmitting}
                            >
                                {t("back_button") || "Voltar"}
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <>
                        <p className="text-muted small mb-3">
                            {isLoggedIn
                                ? t("simple_login_logged_subtitle") ||
                                  "Confirme seus dados para continuar."
                                : t("simple_login_subtitle")}
                        </p>
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                        >
                            <Form.Group className="mb-2">
                                <Form.Label>{t("field_name")}</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FontAwesomeIcon icon={faUser} fixedWidth />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={submitting || isLoggedIn}
                                        autoFocus={!isLoggedIn}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t("field_email")}</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FontAwesomeIcon icon={faEnvelope} fixedWidth />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={submitting || isLoggedIn}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t("field_phone") || "Telefone"}</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FontAwesomeIcon icon={faPhone} fixedWidth />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="tel"
                                        inputMode="numeric"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value.replace(/\D/g, ""))
                                        }
                                        disabled={submitting}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t("field_cpf")}</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FontAwesomeIcon icon={faIdCard} fixedWidth />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={14}
                                        value={cpf}
                                        onChange={(e) =>
                                            setCpf(e.target.value.replace(/\D/g, ""))
                                        }
                                        disabled={submitting}
                                        autoFocus={isLoggedIn}
                                    />
                                </InputGroup>
                            </Form.Group>
                            {error && (
                                <div className="alert alert-danger py-2 mb-2 small">{error}</div>
                            )}
                            <div className="d-grid">
                                <Button type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? t("loading") : t("continue_to_payment")}
                                </Button>
                            </div>
                            {!isLoggedIn && (
                                <p className="text-center small mt-3 mb-0">
                                    {t("simple_login_have_account") ||
                                        "Já tem uma conta?"}{" "}
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        className="p-0 align-baseline"
                                        onClick={() => {
                                            setLoginEmail(email);
                                            setShowLogin(true);
                                            setLoginError("");
                                        }}
                                        disabled={submitting}
                                    >
                                        {t("sign_in") || "Entrar"}
                                    </Button>
                                </p>
                            )}
                        </Form>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}
