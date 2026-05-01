import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
    User,
    IdCard,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Home,
    Building2,
    Lock,
    DollarSign,
    Save,
    ArrowLeft,
    Zap,
} from "lucide-react";
import AuthContext from "../../Contexts/Auth/AuthContext";
import UserContext from "../../Contexts/User/UserContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import UserEditInfo from "../../DTO/Domain/UserEditInfo";
import UserInfo from "../../DTO/Domain/UserInfo";
import UserPhoneInfo from "../../DTO/Domain/UserPhoneInfo";
import UserAddressInfo from "../../DTO/Domain/UserAddressInfo";

/**
 * SellerAddPage — public seller signup, redesigned to match the Home
 * editorial-brutalist visual language (dark hero + light form surface,
 * Tailwind utilities, lucide icons). Business logic, validation and
 * i18n keys are unchanged from the legacy Bootstrap version.
 */
export default function SellerAddPage() {
    const { t } = useTranslation();

    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);

    const [insertMode, setInsertMode] = useState<boolean>(false);
    const [user, setUser] = useState<UserEditInfo>(null);

    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    let { networkSlug } = useParams();
    let navigate = useNavigate();

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
        let userEdit: UserEditInfo;
        if (authContext.sessionInfo) {
            if (authContext.sessionInfo?.userId > 0) {
                userContext.getMe().then((ret) => {
                    if (ret.sucesso) {
                        setUser({
                            ...userEdit,
                            userId: ret.user.userId,
                            name: ret.user.name,
                            email: ret.user.email,
                            birthDate: ret.user.birthDate,
                            iddocument: ret.user.idDocument,
                            pixkey: ret.user.pixKey,
                            phone: ret.user.phones[0]?.phone,
                            zipCode: ret.user.addresses[0]?.zipCode,
                            address: ret.user.addresses[0]?.address,
                            complement: ret.user.addresses[0]?.complement,
                            neighborhood: ret.user.addresses[0]?.neighborhood,
                            city: ret.user.addresses[0]?.city,
                            state: ret.user.addresses[0]?.state,
                        });

                        setInsertMode(false);
                    } else {
                        setUser(userEdit);
                        setInsertMode(true);
                    }
                });
            } else {
                setUser(userEdit);
                setInsertMode(true);
            }
        } else {
            setUser(userEdit);
            setInsertMode(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
        e.preventDefault();

        if (!user.password) {
            throwError(t("sellerAddPage.errors.passwordEmpty"));
            return;
        }
        if (!user.confirmPassword) {
            throwError(t("sellerAddPage.errors.confirmPasswordEmpty"));
            return;
        }
        if (user.password !== user.confirmPassword) {
            throwError(t("sellerAddPage.errors.passwordsNotEqual"));
            return;
        }

        let userFull: UserInfo;
        let userPhone: UserPhoneInfo;
        let userAddr: UserAddressInfo;

        userFull = {
            ...userFull,
            userId: user.userId,
            name: user.name,
            email: user.email,
            idDocument: user.iddocument,
            birthDate: user.birthDate,
            pixKey: user.pixkey,
            password: user.password,
            phones: [],
            addresses: [],
        };
        userFull.phones.push({
            ...userPhone,
            phone: user.phone,
        });
        userFull.addresses.push({
            ...userAddr,
            zipCode: user.zipCode,
            address: user.address,
            complement: user.complement,
            neighborhood: user.neighborhood,
            city: user.city,
            state: user.state,
        });

        if (insertMode) {
            let ret = await userContext.insert(userFull);
            if (ret.sucesso) {
                showSuccessMessage(ret.mensagemSucesso);
            } else {
                throwError(ret.mensagemErro);
            }
        } else {
            let ret = await userContext.update(userFull);
            if (ret.sucesso) {
                showSuccessMessage(ret.mensagemSucesso);
            } else {
                throwError(ret.mensagemErro);
            }
        }
    };

    // Tailwind utility presets — kept inline so this page stays self-contained.
    const inputBase =
        "w-full h-12 pl-11 pr-3 rounded-md bg-white border border-graphite-200 text-graphite-900 placeholder:text-graphite-400 outline-none transition-colors duration-fast focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
    const labelBase =
        "block text-xs font-semibold uppercase tracking-wider text-graphite-500 mb-2";
    const iconWrap =
        "absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400 pointer-events-none";

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />

            {/* Hero strip — dark, mesh background, matches Home language ----- */}
            <section className="mnx-surface-dark relative overflow-hidden bg-mesh-hero">
                <div
                    className="hero-grid absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                />
                <div className="relative max-w-container mx-auto px-shell pt-16 lg:pt-20 pb-14 lg:pb-20">
                    <div className="max-w-3xl animate-fade-up">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase text-orange-200 bg-orange-500/10 border border-orange-500/30">
                            <Zap size={12} aria-hidden="true" />
                            {t("sellerAddPage.eyebrow")}
                        </span>
                        <h1 className="display-headline text-mnx-neutral-50 mt-6 text-4xl sm:text-5xl lg:text-6xl">
                            {t("sellerAddPage.title")}
                        </h1>
                        <p className="mt-5 text-graphite-200 text-base lg:text-lg leading-relaxed max-w-2xl">
                            {t("sellerAddPage.subtitle")}
                        </p>
                    </div>
                </div>
            </section>

            {/* Form surface — light, elevated card on a soft canvas --------- */}
            <section className="mnx-surface-light bg-mnx-neutral-50 py-14 lg:py-20">
                <div className="max-w-container mx-auto px-shell">
                    <div className="max-w-4xl mx-auto">
                        <div className="rounded-2xl bg-white border border-graphite-200 shadow-lg overflow-hidden">
                            {/* Card header band */}
                            <div className="px-6 lg:px-10 py-6 border-b border-graphite-200 bg-mnx-neutral-50">
                                <p className="text-sm text-graphite-600 leading-relaxed">
                                    {t("sellerAddPage.registrationNote")}
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="px-6 lg:px-10 py-8 lg:py-10 space-y-10"
                                noValidate
                            >
                                {/* Section: Personal --------------------- */}
                                <div>
                                    <SectionHeading
                                        index="01"
                                        title={t("sellerAddPage.sectionPersonal")}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                        <div className="md:col-span-2">
                                            <label className={labelBase} htmlFor="seller-name">
                                                {t("sellerAddPage.nameLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <User size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-name"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t("sellerAddPage.namePlaceholder")}
                                                    value={user?.name ?? ""}
                                                    onChange={(e) =>
                                                        setUser({ ...user, name: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelBase} htmlFor="seller-cpf">
                                                {t("sellerAddPage.cpfLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <IdCard size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-cpf"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t("sellerAddPage.cpfPlaceholder")}
                                                    value={user?.iddocument ?? ""}
                                                    onChange={(e) =>
                                                        setUser({
                                                            ...user,
                                                            iddocument: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelBase} htmlFor="seller-birthday">
                                                {t("sellerAddPage.birthdayLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <Calendar size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-birthday"
                                                    type="date"
                                                    className={inputBase}
                                                    placeholder={t(
                                                        "sellerAddPage.birthdayPlaceholder"
                                                    )}
                                                    value={user?.birthDate ?? ""}
                                                    onChange={(e) =>
                                                        setUser({
                                                            ...user,
                                                            birthDate: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelBase} htmlFor="seller-email">
                                                {t("sellerAddPage.emailLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <Mail size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-email"
                                                    type="email"
                                                    className={inputBase}
                                                    placeholder={t("sellerAddPage.emailPlaceholder")}
                                                    value={user?.email ?? ""}
                                                    onChange={(e) =>
                                                        setUser({ ...user, email: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelBase} htmlFor="seller-phone">
                                                {t("sellerAddPage.phoneLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <Phone size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-phone"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t("sellerAddPage.phonePlaceholder")}
                                                    value={user?.phone ?? ""}
                                                    onChange={(e) =>
                                                        setUser({ ...user, phone: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Address ---------------------- */}
                                <div>
                                    <SectionHeading
                                        index="02"
                                        title={t("sellerAddPage.sectionAddress")}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-5 mt-6">
                                        <div className="md:col-span-2">
                                            <label className={labelBase} htmlFor="seller-zip">
                                                {t("sellerAddPage.zipCodeLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <MapPin size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-zip"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t(
                                                        "sellerAddPage.zipCodePlaceholder"
                                                    )}
                                                    value={user?.zipCode ?? ""}
                                                    onChange={(e) =>
                                                        setUser({
                                                            ...user,
                                                            zipCode: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-4">
                                            <label className={labelBase} htmlFor="seller-address">
                                                {t("sellerAddPage.addressLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <Home size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-address"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t(
                                                        "sellerAddPage.addressPlaceholder"
                                                    )}
                                                    value={user?.address ?? ""}
                                                    onChange={(e) =>
                                                        setUser({
                                                            ...user,
                                                            address: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className={labelBase} htmlFor="seller-complement">
                                                {t("sellerAddPage.complementLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <Building2 size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-complement"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t(
                                                        "sellerAddPage.complementPlaceholder"
                                                    )}
                                                    value={user?.complement ?? ""}
                                                    onChange={(e) =>
                                                        setUser({
                                                            ...user,
                                                            complement: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-3">
                                            <label
                                                className={labelBase}
                                                htmlFor="seller-neighborhood"
                                            >
                                                {t("sellerAddPage.neighborhoodLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <MapPin size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-neighborhood"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t(
                                                        "sellerAddPage.neighborhoodPlaceholder"
                                                    )}
                                                    value={user?.neighborhood ?? ""}
                                                    onChange={(e) =>
                                                        setUser({
                                                            ...user,
                                                            neighborhood: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-4">
                                            <label className={labelBase} htmlFor="seller-city">
                                                {t("sellerAddPage.cityLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <Building2 size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-city"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t("sellerAddPage.cityPlaceholder")}
                                                    value={user?.city ?? ""}
                                                    onChange={(e) =>
                                                        setUser({ ...user, city: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={labelBase} htmlFor="seller-state">
                                                {t("sellerAddPage.stateLabel")}
                                            </label>
                                            <div className="relative">
                                                <span className={iconWrap}>
                                                    <MapPin size={18} aria-hidden="true" />
                                                </span>
                                                <input
                                                    id="seller-state"
                                                    type="text"
                                                    className={inputBase}
                                                    placeholder={t("sellerAddPage.statePlaceholder")}
                                                    value={user?.state ?? ""}
                                                    onChange={(e) =>
                                                        setUser({ ...user, state: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: PIX ---------------------------- */}
                                <div>
                                    <SectionHeading
                                        index="03"
                                        title={t("sellerAddPage.sectionPix")}
                                    />

                                    <div className="mt-6">
                                        <label className={labelBase} htmlFor="seller-pix">
                                            {t("sellerAddPage.pixKeyLabel")}
                                        </label>
                                        <div className="relative">
                                            <span className={iconWrap}>
                                                <DollarSign size={18} aria-hidden="true" />
                                            </span>
                                            <input
                                                id="seller-pix"
                                                type="text"
                                                className={inputBase}
                                                placeholder={t("sellerAddPage.pixKeyPlaceholder")}
                                                value={user?.pixkey ?? ""}
                                                onChange={(e) =>
                                                    setUser({ ...user, pixkey: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Password (insert only) -------- */}
                                {insertMode && (
                                    <div>
                                        <SectionHeading
                                            index="04"
                                            title={t("sellerAddPage.sectionPassword")}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                            <div>
                                                <label
                                                    className={labelBase}
                                                    htmlFor="seller-password"
                                                >
                                                    {t("sellerAddPage.passwordLabel")}
                                                </label>
                                                <div className="relative">
                                                    <span className={iconWrap}>
                                                        <Lock size={18} aria-hidden="true" />
                                                    </span>
                                                    <input
                                                        id="seller-password"
                                                        type="password"
                                                        className={inputBase}
                                                        placeholder={t(
                                                            "sellerAddPage.passwordPlaceholder"
                                                        )}
                                                        value={user?.password ?? ""}
                                                        onChange={(e) =>
                                                            setUser({
                                                                ...user,
                                                                password: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    className={labelBase}
                                                    htmlFor="seller-confirm-password"
                                                >
                                                    {t("sellerAddPage.confirmPasswordLabel")}
                                                </label>
                                                <div className="relative">
                                                    <span className={iconWrap}>
                                                        <Lock size={18} aria-hidden="true" />
                                                    </span>
                                                    <input
                                                        id="seller-confirm-password"
                                                        type="password"
                                                        className={inputBase}
                                                        placeholder={t(
                                                            "sellerAddPage.confirmPasswordPlaceholder"
                                                        )}
                                                        value={user?.confirmPassword ?? ""}
                                                        onChange={(e) =>
                                                            setUser({
                                                                ...user,
                                                                confirmPassword: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions ----------------------------------- */}
                                <div className="pt-4 border-t border-graphite-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(networkSlug ? "/" + networkSlug : "/")
                                        }
                                        className="inline-flex h-12 items-center justify-center px-5 rounded-md text-sm font-semibold text-graphite-700 border border-graphite-300 hover:border-graphite-500 hover:bg-graphite-50 transition-colors duration-fast"
                                    >
                                        <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
                                        {t("buttons.back")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={userContext.loadingUpdate}
                                        className="cta-primary inline-flex h-12 items-center justify-center px-7 rounded-md text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-fast shadow-glow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                                    >
                                        <Save size={18} className="mr-2" aria-hidden="true" />
                                        {userContext.loadingUpdate
                                            ? t("loading")
                                            : t("buttons.save")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

/**
 * SectionHeading — small editorial label used between form blocks.
 * Replaces the legacy <hr /> dividers with a numbered section header.
 */
function SectionHeading({ index, title }: { index: string; title: string }) {
    return (
        <div className="flex items-baseline gap-4 border-b border-graphite-200 pb-3">
            <span className="font-display text-sm font-bold tracking-wider text-orange-500">
                {index}
            </span>
            <h2 className="font-display text-xl lg:text-2xl font-bold text-graphite-900 tracking-tight">
                {title}
            </h2>
        </div>
    );
}
