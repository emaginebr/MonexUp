import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Zap,
    CheckCircle2,
    UserCheck,
    UserX,
    ArrowLeft,
    MailWarning,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import AuthContext from "../../Contexts/Auth/AuthContext";
import InviteContext from "../../Contexts/Invite/InviteContext";
import ConfirmModal from "../../Components/ConfirmModal";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { InviteDetailInfo } from "../../DTO/Domain/InviteInfo";

type StateTone = "success" | "danger" | "warning" | "info";

const toneStyles: Record<StateTone, { ring: string; icon: string }> = {
    success: {
        ring: "border-emerald-500/30",
        icon: "text-emerald-600 bg-emerald-50",
    },
    danger: {
        ring: "border-rose-500/30",
        icon: "text-rose-600 bg-rose-50",
    },
    warning: {
        ring: "border-amber-500/30",
        icon: "text-amber-600 bg-amber-50",
    },
    info: {
        ring: "border-orange-500/30",
        icon: "text-orange-600 bg-orange-50",
    },
};

const primaryButton =
    "inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold shadow-glow-md transition-colors duration-fast";

const dangerButton =
    "inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 font-semibold transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed";

const secondaryButton =
    "inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-white hover:bg-graphite-50 border border-graphite-300 text-graphite-700 font-semibold transition-colors duration-fast";

export default function AcceptInvitePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    const inviteContext = useContext(InviteContext);

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [detail, setDetail] = useState<InviteDetailInfo>(null);
    const [confirmDecline, setConfirmDecline] = useState<boolean>(false);

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

    // Login gate — mirror how request-access/account pages behave: no session
    // means we bounce to the login page (the token stays in the URL so the
    // user returns here after signing in).
    useEffect(() => {
        if (authContext.loading) return;
        if (!authContext.sessionInfo) {
            navigate("/account/login");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authContext.loading, authContext.sessionInfo]);

    useEffect(() => {
        if (authContext.loading) return;
        if (!authContext.sessionInfo) return;
        if (!token) {
            throwError(t("acceptInvitePage.errorGeneric"));
            return;
        }
        inviteContext.getDetail(token).then((ret) => {
            if (ret.sucesso && ret.detail) {
                setDetail(ret.detail);
            } else {
                throwError(ret.mensagemErro || t("acceptInvitePage.errorGeneric"));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authContext.loading, authContext.sessionInfo, token]);

    const handleAccept = async () => {
        if (!token) return;
        const ret = await inviteContext.accept(token);
        if (ret.sucesso) {
            showSuccessMessage(t("acceptInvitePage.acceptedSuccess"));
            navigate("/admin/dashboard");
        } else {
            throwError(ret.mensagemErro || t("acceptInvitePage.errorGeneric"));
        }
    };

    const handleDecline = async () => {
        if (!token) return;
        setConfirmDecline(false);
        const ret = await inviteContext.decline(token);
        if (ret.sucesso) {
            showSuccessMessage(t("acceptInvitePage.declinedSuccess"));
            navigate("/");
        } else {
            throwError(ret.mensagemErro || t("acceptInvitePage.errorGeneric"));
        }
    };

    const loading = inviteContext.loadingDetail;
    const acting = inviteContext.loadingAction;

    const StateCard = ({
        tone,
        icon,
        title,
        children,
        actions,
    }: {
        tone: StateTone;
        icon: React.ReactNode;
        title: string;
        children: React.ReactNode;
        actions?: React.ReactNode;
    }) => {
        const tones = toneStyles[tone];
        return (
            <article
                className={`rounded-2xl bg-white border ${tones.ring} shadow-lg overflow-hidden`}
            >
                <div className="px-6 lg:px-10 pt-8 lg:pt-10 pb-6 flex items-start gap-4">
                    <div
                        className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${tones.icon}`}
                        aria-hidden="true"
                    >
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h2 className="display-headline text-2xl lg:text-3xl text-graphite-900">
                            {title}
                        </h2>
                    </div>
                </div>
                <div className="px-6 lg:px-10 pb-8 lg:pb-10 space-y-4 text-graphite-600 text-base leading-relaxed">
                    {children}
                </div>
                {actions && (
                    <div className="px-6 lg:px-10 py-6 border-t border-graphite-200 bg-mnx-neutral-50 flex flex-wrap gap-3 justify-end">
                        {actions}
                    </div>
                )}
            </article>
        );
    };

    const renderBody = () => {
        if (loading || !detail) {
            return (
                <StateCard
                    tone="info"
                    icon={<UserCheck size={26} aria-hidden="true" />}
                    title=""
                >
                    <p>
                        <Skeleton count={2} />
                    </p>
                </StateCard>
            );
        }

        // Signed in as the wrong account.
        if (!detail.isForCurrentUser) {
            return (
                <StateCard
                    tone="warning"
                    icon={<MailWarning size={26} aria-hidden="true" />}
                    title={t("acceptInvitePage.wrongAccountTitle")}
                >
                    <p>{t("acceptInvitePage.wrongAccountBody")}</p>
                </StateCard>
            );
        }

        // Already an active member of the network.
        if (detail.alreadyActiveMember) {
            return (
                <StateCard
                    tone="success"
                    icon={<UserCheck size={26} aria-hidden="true" />}
                    title={t("acceptInvitePage.alreadyMemberTitle")}
                    actions={
                        <button
                            type="button"
                            className={primaryButton}
                            onClick={() => navigate("/admin/dashboard")}
                        >
                            <Zap size={18} aria-hidden="true" />
                            {t("acceptInvitePage.goToDashboard")}
                        </button>
                    }
                >
                    <p>
                        {t("acceptInvitePage.alreadyMemberBody", {
                            network: detail.networkName,
                        })}
                    </p>
                </StateCard>
            );
        }

        // Actionable invite.
        return (
            <StateCard
                tone="info"
                icon={<UserCheck size={26} aria-hidden="true" />}
                title={t("acceptInvitePage.title")}
                actions={
                    <>
                        <button
                            type="button"
                            className={dangerButton}
                            disabled={acting}
                            onClick={() => setConfirmDecline(true)}
                        >
                            <UserX size={18} aria-hidden="true" />
                            {t("acceptInvitePage.decline")}
                        </button>
                        <button
                            type="button"
                            className={primaryButton}
                            disabled={acting}
                            onClick={handleAccept}
                        >
                            {acting ? (
                                t("loading")
                            ) : (
                                <>
                                    <CheckCircle2 size={18} aria-hidden="true" />
                                    {t("acceptInvitePage.accept")}
                                </>
                            )}
                        </button>
                    </>
                }
            >
                <p>
                    {t("acceptInvitePage.invitedBy", {
                        inviter: detail.inviterName,
                        network: detail.networkName,
                    })}
                </p>
            </StateCard>
        );
    };

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />

            <ConfirmModal
                show={confirmDecline}
                title={t("acceptInvitePage.declineConfirmTitle")}
                message={t("acceptInvitePage.declineConfirmMessage")}
                loading={acting}
                onClose={() => setConfirmDecline(false)}
                onConfirm={handleDecline}
            />

            {/* Hero strip — dark, mesh background, matches Home language */}
            <section className="mnx-surface-dark relative overflow-hidden bg-mesh-hero">
                <div
                    className="hero-grid absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                />
                <div className="relative max-w-container mx-auto px-shell pt-16 lg:pt-20 pb-14 lg:pb-20">
                    <div className="max-w-3xl animate-fade-up">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase text-orange-200 bg-orange-500/10 border border-orange-500/30">
                            <Zap size={12} aria-hidden="true" />
                            {t("acceptInvitePage.eyebrow")}
                        </span>
                        <h1 className="display-headline text-mnx-neutral-50 mt-6 text-4xl sm:text-5xl lg:text-6xl">
                            {loading || !detail ? (
                                <Skeleton width={320} />
                            ) : (
                                detail.networkName
                            )}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Card surface — light, elevated card on a soft canvas */}
            <section className="mnx-surface-light bg-mnx-neutral-50 py-14 lg:py-20">
                <div className="max-w-container mx-auto px-shell">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {renderBody()}
                        <div>
                            <button
                                type="button"
                                className={secondaryButton}
                                onClick={() => navigate("/")}
                            >
                                <ArrowLeft size={18} aria-hidden="true" />
                                {t("acceptInvitePage.backHome")}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
