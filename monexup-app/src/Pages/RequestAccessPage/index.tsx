import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
    Zap,
    CheckCircle2,
    XCircle,
    Lock,
    Clock3,
    ArrowLeft,
    UserPlus,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import AuthContext from "../../Contexts/Auth/AuthContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { UserNetworkStatusEnum } from "../../DTO/Enum/UserNetworkStatusEnum";

type StateTone = "success" | "danger" | "warning" | "info";

const toneStyles: Record<StateTone, { ring: string; icon: string; pill: string }> = {
    success: {
        ring: "border-emerald-500/30",
        icon: "text-emerald-600 bg-emerald-50",
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    danger: {
        ring: "border-rose-500/30",
        icon: "text-rose-600 bg-rose-50",
        pill: "bg-rose-50 text-rose-700 border-rose-200",
    },
    warning: {
        ring: "border-amber-500/30",
        icon: "text-amber-600 bg-amber-50",
        pill: "bg-amber-50 text-amber-700 border-amber-200",
    },
    info: {
        ring: "border-orange-500/30",
        icon: "text-orange-600 bg-orange-50",
        pill: "bg-orange-50 text-orange-700 border-orange-200",
    },
};

const primaryButton =
    "inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold shadow-glow-md transition-colors duration-fast";

const secondaryButton =
    "inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-white hover:bg-graphite-50 border border-graphite-300 text-graphite-700 font-semibold transition-colors duration-fast";

export default function RequestAccessPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

    const { networkSlug } = useParams();

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

    useEffect(() => {
        networkContext.getBySlug(networkSlug).then((ret) => {
            if (ret.sucesso) {
                if (authContext.sessionInfo) {
                    networkContext.getUserNetwork(ret.network.networkId).then((retUserNetwork) => {
                        if (!retUserNetwork.sucesso) {
                            throwError(retUserNetwork.mensagemErro);
                        }
                    });
                }
            } else {
                throwError(ret.mensagemErro);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const networkName = networkContext.network?.name;
    const loading = networkContext.loading;

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

    const MessageActive = () => (
        <StateCard
            tone="success"
            icon={<CheckCircle2 size={26} aria-hidden="true" />}
            title={t("requestAccessPage.youAreApproved")}
            actions={
                <button
                    type="button"
                    className={primaryButton}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/admin/dashboard");
                    }}
                >
                    <Zap size={18} aria-hidden="true" />
                    {t("requestAccessPage.goToDashboard")}
                </button>
            }
        >
            {loading ? (
                <p>
                    <Skeleton />
                </p>
            ) : (
                <p>
                    {t("requestAccessPage.welcomeTo_part1")}
                    <strong className="text-graphite-900">{networkName}</strong>
                    {t("requestAccessPage.welcomeTo_part2")}
                </p>
            )}
            <p>{t("requestAccessPage.requestApprovedInfo")}</p>
            <p>{t("requestAccessPage.youCanNow")}</p>
            <p className="font-semibold text-graphite-900">
                {t("requestAccessPage.everythingReady")}
            </p>
        </StateCard>
    );

    const MessageInactive = () => (
        <StateCard
            tone="danger"
            icon={<XCircle size={26} aria-hidden="true" />}
            title={t("requestAccessPage.accessDenied")}
        >
            {loading ? (
                <p>
                    <Skeleton />
                </p>
            ) : (
                <p>
                    {t("requestAccessPage.accessDeniedMessage_part1")}
                    <strong className="text-graphite-900">{networkName}</strong>
                    {t("requestAccessPage.accessDeniedMessage_part2")}
                    <strong className="text-rose-700">
                        {t("requestAccessPage.notApproved")}
                    </strong>
                    .
                </p>
            )}
            <p>{t("requestAccessPage.accessDeniedReason")}</p>
        </StateCard>
    );

    const MessageWaitForApproval = () => (
        <StateCard
            tone="warning"
            icon={<Clock3 size={26} aria-hidden="true" />}
            title={t("requestAccessPage.requestSentSuccessfully")}
        >
            <p>
                {t("requestAccessPage.requestSentSuccessInfo_part1")}
                <strong className="text-graphite-900">{networkName}</strong>
                {t("requestAccessPage.requestSentSuccessInfo_part2")}
            </p>
            <p>{t("requestAccessPage.waitForApprovalInfo")}</p>
            <p>
                <strong className="text-amber-700">
                    {t("requestAccessPage.importantTag")}
                </strong>
                {t("requestAccessPage.pendingRequestInfo")}
            </p>
        </StateCard>
    );

    const MessageBlocked = () => (
        <StateCard
            tone="danger"
            icon={<Lock size={26} aria-hidden="true" />}
            title={t("requestAccessPage.accessBlocked")}
        >
            {loading ? (
                <p>
                    <Skeleton />
                </p>
            ) : (
                <p>
                    {t("requestAccessPage.accessBlockedMessage_part1")}
                    <strong className="text-graphite-900">{networkName}</strong>
                    {t("requestAccessPage.accessBlockedMessage_part2")}
                    <strong className="text-rose-700">
                        {t("requestAccessPage.blockedWord")}
                    </strong>
                    .
                </p>
            )}
            <p>{t("requestAccessPage.accessBlockedReason")}</p>
            <p>{t("requestAccessPage.accessBlockedConsequences")}</p>
            <p>{t("requestAccessPage.contactManagerForBlocked")}</p>
        </StateCard>
    );

    const MessageWithUserNetwork = (status: UserNetworkStatusEnum) => {
        switch (status) {
            case UserNetworkStatusEnum.Active:
                return <MessageActive />;
            case UserNetworkStatusEnum.Inactive:
                return <MessageInactive />;
            case UserNetworkStatusEnum.Blocked:
                return <MessageBlocked />;
            case UserNetworkStatusEnum.WaitForApproval:
                return <MessageWaitForApproval />;
            default:
                return null;
        }
    };

    const JoinForm = () => (
        <StateCard
            tone="info"
            icon={<UserPlus size={26} aria-hidden="true" />}
            title={
                loading
                    ? ""
                    : t("requestAccessPage.joinNetworkQuestion", {
                          networkName,
                      })
            }
            actions={
                <>
                    <button
                        type="button"
                        className={secondaryButton}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/" + networkContext.network?.slug);
                        }}
                    >
                        <ArrowLeft size={18} aria-hidden="true" />
                        {t("requestAccessPage.noGoBack")}
                    </button>
                    <button
                        type="button"
                        className={primaryButton}
                        disabled={networkContext.loadingRequestAccess}
                        onClick={async (e) => {
                            e.preventDefault();
                            const ret = await networkContext.requestAccess(
                                networkContext.network?.networkId
                            );
                            if (ret.sucesso) {
                                showSuccessMessage(ret.mensagemSucesso);
                            } else {
                                throwError(ret.mensagemErro);
                            }
                        }}
                    >
                        {networkContext.loadingRequestAccess ? (
                            t("loading")
                        ) : (
                            <>
                                <CheckCircle2 size={18} aria-hidden="true" />
                                {t("requestAccessPage.yesIWantToJoin")}
                            </>
                        )}
                    </button>
                </>
            }
        >
            {loading ? (
                <>
                    <p>
                        <Skeleton count={3} />
                    </p>
                    <p>
                        <Skeleton count={1} />
                    </p>
                    <p>
                        <Skeleton count={1} />
                    </p>
                </>
            ) : (
                <>
                    <p>{t("requestAccessPage.byJoiningInfo")}</p>
                    <p>
                        <strong className="text-graphite-900">
                            {t("requestAccessPage.noteTag")}
                        </strong>
                        {t("requestAccessPage.approvalInfo")}
                    </p>
                    <p className="font-semibold text-graphite-900">
                        {t("requestAccessPage.confirmRequestAccess")}
                    </p>
                </>
            )}
        </StateCard>
    );

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
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
                            {t("be_a_representative")}
                        </span>
                        <h1 className="display-headline text-mnx-neutral-50 mt-6 text-4xl sm:text-5xl lg:text-6xl">
                            {loading ? (
                                <Skeleton width={320} />
                            ) : (
                                t("requestAccessPage.joinNetworkQuestion", {
                                    networkName,
                                })
                            )}
                        </h1>
                        <p className="mt-5 text-graphite-200 text-base lg:text-lg leading-relaxed max-w-2xl">
                            {t("requestAccessPage.byJoiningInfo")}
                        </p>
                    </div>
                </div>
            </section>

            {/* Card surface — light, elevated card on a soft canvas */}
            <section className="mnx-surface-light bg-mnx-neutral-50 py-14 lg:py-20">
                <div className="max-w-container mx-auto px-shell">
                    <div className="max-w-3xl mx-auto">
                        {networkContext.userNetwork
                            ? MessageWithUserNetwork(networkContext.userNetwork.status)
                            : <JoinForm />}
                    </div>
                </div>
            </section>
        </>
    );
}
