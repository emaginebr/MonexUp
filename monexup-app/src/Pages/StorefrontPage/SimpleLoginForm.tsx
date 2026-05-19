import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faIdCard } from "@fortawesome/free-solid-svg-icons";
import UserContext from "../../Contexts/User/UserContext";
import { isValidCpf } from "../../Infra/Validators/CpfValidator";

export interface SimpleLoginResult {
    name: string;
    email: string;
    documentId: string;
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
    return Array.from(arr).map(b => b.toString(36)).join("") + "Aa1!";
};

export default function SimpleLoginForm({ show, onClose, onSuccess, onError, prefill, skipRegister }: SimpleLoginFormProps) {
    const { t } = useTranslation();
    const userContext = useContext(UserContext);

    const [name, setName] = useState<string>(prefill?.name || "");
    const [email, setEmail] = useState<string>(prefill?.email || "");
    const [cpf, setCpf] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const reset = () => {
        setName(prefill?.name || "");
        setEmail(prefill?.email || "");
        setCpf("");
        setError("");
    };

    const handleClose = () => {
        if (submitting) return;
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

        const result: SimpleLoginResult = {
            name: name.trim(),
            email: email.trim(),
            documentId: cpfDigits,
        };

        if (skipRegister) {
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
            phones: [],
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

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton={!submitting}>
                <Modal.Title>{t("simple_login_title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted small mb-3">{t("simple_login_subtitle")}</p>
                <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <Form.Group className="mb-2">
                        <Form.Label>{t("field_name")}</Form.Label>
                        <InputGroup>
                            <InputGroup.Text><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={submitting || !!prefill?.name}
                                autoFocus={!prefill?.name}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t("field_email")}</Form.Label>
                        <InputGroup>
                            <InputGroup.Text><FontAwesomeIcon icon={faEnvelope} fixedWidth /></InputGroup.Text>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={submitting || !!prefill?.email}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t("field_cpf")}</Form.Label>
                        <InputGroup>
                            <InputGroup.Text><FontAwesomeIcon icon={faIdCard} fixedWidth /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                inputMode="numeric"
                                maxLength={14}
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
                                disabled={submitting}
                                autoFocus={!!prefill?.name}
                            />
                        </InputGroup>
                    </Form.Group>
                    {error && <div className="alert alert-danger py-2 mb-2 small">{error}</div>}
                    <div className="d-grid">
                        <Button type="submit" variant="primary" disabled={submitting}>
                            {submitting ? t("loading") : t("continue_to_payment")}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
