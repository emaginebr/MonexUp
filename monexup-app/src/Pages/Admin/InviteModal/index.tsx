import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/esm/Button";
import { useTranslation } from "react-i18next";
import { Copy, Check, Mail, Link2, UserCheck, UserPlus } from "lucide-react";
import InviteContext from "../../../Contexts/Invite/InviteContext";
import MessageToast from "../../../Components/MessageToast";
import { MessageToastEnum } from "../../../DTO/Enum/MessageToastEnum";
import { InviteResultInfo } from "../../../DTO/Domain/InviteInfo";

interface IInviteModalParam {
    show: boolean;
    networkId: number;
    onClose: () => void;
}

// Basic RFC-5322-ish email shape check. Account existence is NEVER probed
// from the client — the MonexUp backend decides hasAccount/alreadyMember.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteModal(param: IInviteModalParam) {
    const { t } = useTranslation();
    const inviteContext = useContext(InviteContext);

    const [email, setEmail] = useState<string>("");
    const [result, setResult] = useState<InviteResultInfo>(null);
    const [inviteUrl, setInviteUrl] = useState<string>("");
    const [copied, setCopied] = useState<boolean>(false);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

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

    // Reset transient state every time the modal is (re)opened.
    useEffect(() => {
        if (param.show) {
            setEmail("");
            setResult(null);
            setInviteUrl("");
            setCopied(false);
        }
    }, [param.show]);

    const handleGenerate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = email.trim();
        if (!EMAIL_REGEX.test(trimmed)) {
            throwError(t("inviteModal.invalidEmail"));
            return;
        }
        setResult(null);
        setInviteUrl("");
        setCopied(false);

        const ret = await inviteContext.invite(param.networkId, trimmed);
        if (ret.sucesso && ret.result) {
            setResult(ret.result);
            const url = inviteContext.buildInviteUrl({
                token: ret.result.token,
                hasAccount: ret.result.hasAccount,
                networkSlug: ret.result.networkSlug,
            });
            setInviteUrl(url);
            showSuccessMessage(t("inviteModal.successGenerated"));
        } else {
            throwError(ret.mensagemErro || t("inviteModal.errorGeneric"));
        }
    };

    const handleCopy = async () => {
        if (!inviteUrl) return;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API unavailable — the link stays visible for manual copy.
        }
    };

    return (
        <>
            <Modal show={param.show} onHide={param.onClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <Mail size={18} aria-hidden="true" />
                        <span>{t("inviteModal.title")}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleGenerate}>
                        <label
                            htmlFor="invite-email"
                            className="form-label fw-semibold small text-uppercase text-secondary"
                        >
                            {t("inviteModal.emailLabel")}
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <Mail size={16} aria-hidden="true" />
                            </span>
                            <input
                                id="invite-email"
                                type="email"
                                className="form-control"
                                placeholder={t("inviteModal.emailPlaceholder")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={inviteContext.loading}
                            />
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={inviteContext.loading}
                            >
                                {inviteContext.loading
                                    ? t("inviteModal.generating")
                                    : t("inviteModal.generateButton")}
                            </Button>
                        </div>
                    </form>

                    {result && (
                        <div className="mt-4">
                            {result.alreadyMember ? (
                                <div className="alert alert-info d-flex align-items-start gap-2 mb-0">
                                    <UserCheck size={18} aria-hidden="true" className="mt-1" />
                                    <span>{t("inviteModal.alreadyMember")}</span>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className={
                                            "alert d-flex align-items-start gap-2 " +
                                            (result.hasAccount
                                                ? "alert-primary"
                                                : "alert-success")
                                        }
                                    >
                                        {result.hasAccount ? (
                                            <UserCheck
                                                size={18}
                                                aria-hidden="true"
                                                className="mt-1"
                                            />
                                        ) : (
                                            <UserPlus
                                                size={18}
                                                aria-hidden="true"
                                                className="mt-1"
                                            />
                                        )}
                                        <span>
                                            {result.hasAccount
                                                ? t("inviteModal.existingAccountHint")
                                                : t("inviteModal.newAccountHint")}
                                        </span>
                                    </div>

                                    <label className="form-label fw-semibold small text-uppercase text-secondary d-flex align-items-center gap-1">
                                        <Link2 size={14} aria-hidden="true" />
                                        {t("inviteModal.linkLabel")}
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            readOnly
                                            value={inviteUrl}
                                            onFocus={(e) => e.currentTarget.select()}
                                            className="form-control font-monospace small"
                                        />
                                        <Button
                                            variant={copied ? "success" : "outline-secondary"}
                                            onClick={handleCopy}
                                            type="button"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check
                                                        size={16}
                                                        className="me-1"
                                                        aria-hidden="true"
                                                    />
                                                    {t("inviteModal.copied")}
                                                </>
                                            ) : (
                                                <>
                                                    <Copy
                                                        size={16}
                                                        className="me-1"
                                                        aria-hidden="true"
                                                    />
                                                    {t("inviteModal.copyButton")}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={param.onClose}>
                        {t("inviteModal.close")}
                    </Button>
                </Modal.Footer>
            </Modal>

            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />
        </>
    );
}
