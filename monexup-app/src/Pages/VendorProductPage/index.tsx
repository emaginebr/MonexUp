/**
 * VendorProductPage — router-aware container for the public vendor product
 * detail page (route: `/{networkSlug}/store/{sellerSlug}/{productSlug}`).
 *
 * Responsibilities:
 *   1. Resolve `network`, `seller` and `product` via existing contexts.
 *   2. Pick the visual template by `network.template` through the registry
 *      (`templates/index.ts`). Unknown values fall back to "editorial".
 *   3. Own all checkout state (selected payment method, donation amount,
 *      modals). Reuses `SimpleLoginForm` + `PixModalContainer` from the
 *      existing `StorefrontPage` to keep the PIX flow identical.
 *   4. Render `VendorFooter` (condensed MonexUp powered-by strip). The page
 *      is registered outside `<Layout />` in `App.tsx` so the vendor brand
 *      owns the entire chrome.
 *
 * NOTE on non-PIX payment methods: Boleto and Card are intentional UI stubs
 * per the approval spec. Selecting them is fine; submitting fires a "coming
 * soon" toast and does NOT call the backend. Backend wiring for Boleto/Card
 * is out of scope for this iteration.
 */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import AuthContext from "../../Contexts/Auth/AuthContext";
import OrderContext from "../../Contexts/Order/OrderContext";
import UserContext from "../../Contexts/User/UserContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import PixModalContainer, { PixCustomer } from "../StorefrontPage/PixModalContainer";
import { isDonation, isOpenDonation, StorefrontProductInfo } from "../StorefrontPage/types";
import VendorFooter from "./VendorFooter";
import VendorProductSkeleton from "./VendorProductSkeleton";
import LoginPasswordModal from "./LoginPasswordModal";
import { resolveTemplate } from "./templates";
import { VendorBuyer, VendorPaymentMethod, VendorProductViewModel } from "./types";
import { isValidCpf } from "../../Infra/Validators/CpfValidator";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PageState = "loading" | "ready" | "network_not_found" | "seller_not_found" | "product_not_found";

export default function VendorProductPage() {
    const { t } = useTranslation();
    const { networkSlug, sellerSlug, productSlug } = useParams<{
        networkSlug: string;
        sellerSlug: string;
        productSlug: string;
    }>();

    const networkContext = useContext(NetworkContext);
    const productContext = useContext(ProductContext);
    const authContext = useContext(AuthContext);
    const orderContext = useContext(OrderContext);
    const userContext = useContext(UserContext);

    const [pageState, setPageState] = useState<PageState>("loading");
    const [view, setView] = useState<VendorProductViewModel | null>(null);

    const [paymentMethod, setPaymentMethod] = useState<VendorPaymentMethod>("pix");
    const [amount, setAmount] = useState<number>(0);

    const [toastDialog, setToastDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
    const [toastShow, setToastShow] = useState<boolean>(false);
    const [toastMsg, setToastMsg] = useState<string>("");

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [loginOpen, setLoginOpen] = useState<boolean>(false);
    const [pixOpen, setPixOpen] = useState<boolean>(false);
    const [pixCustomer, setPixCustomer] = useState<PixCustomer | null>(null);

    // Inline buyer state — kept on the page (not the template) so login or
    // network changes can re-sync without remounting the template tree.
    const [buyer, setBuyer] = useState<VendorBuyer>({
        name: "",
        email: "",
        phone: "",
        cpf: "",
    });
    const isLoggedIn = Boolean(authContext.sessionInfo);

    // Whenever the logged-in user changes, refill buyer form. Depends on
    // sessionInfo.userId (primitive) not the whole object — nauth.refreshUser()
    // mutates the sessionInfo reference on every call, which would otherwise
    // cause an infinite getMe loop.
    const loadedForUserIdRef = useRef<number | null>(null);
    const sessionUserId = authContext.sessionInfo?.userId ?? null;
    const sessionName = authContext.sessionInfo?.name || "";
    const sessionEmail = authContext.sessionInfo?.email || "";

    useEffect(() => {
        if (!sessionUserId) {
            loadedForUserIdRef.current = null;
            return;
        }

        // Seed name + email immediately from the session.
        setBuyer((b) => ({
            ...b,
            name: sessionName,
            email: sessionEmail,
        }));

        // Guard: skip once we've already loaded usable data for this userId.
        // We only mark ref as loaded when we ACTUALLY received idDocument or
        // phone — otherwise the next mount/effect retries. This prevents a
        // stale partial refresh from permanently blocking the fetch.
        if (loadedForUserIdRef.current === sessionUserId) return;

        let cancelled = false;
        // NAuth's refresh sometimes resolves before the session is fully
        // hydrated and returns a user without phones/idDocument. Retry with
        // exponential backoff until we get something usable or hit the cap.
        const delays = [0, 400, 1200, 2500];
        (async () => {
            for (const wait of delays) {
                if (cancelled) return;
                if (wait) await new Promise((r) => setTimeout(r, wait));
                if (cancelled) return;
                try {
                    const ret = await userContext.getMe();
                    if (cancelled) return;
                    const u = ret?.user;
                    if (!u) continue;
                    const phoneDigits = u.phones?.[0]?.phone || "";
                    const gotUsable = Boolean(u.idDocument || phoneDigits);
                    setBuyer((b) => ({
                        ...b,
                        name: u.name || b.name,
                        email: u.email || b.email,
                        cpf: u.idDocument || b.cpf,
                        phone: phoneDigits || b.phone,
                    }));
                    if (gotUsable) {
                        loadedForUserIdRef.current = sessionUserId;
                        return;
                    }
                } catch {
                    // Try again on next tick.
                }
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionUserId, sessionName, sessionEmail]);

    const patchBuyer = (patch: Partial<VendorBuyer>) =>
        setBuyer((b) => ({ ...b, ...patch }));

    const handleLogout = () => {
        const ret = authContext.logout?.();
        // Logout returns sync result on this app; flip back to anonymous
        // buyer fields so the form is editable again. PixModal state stays
        // intact — user only resets identity, not the cart.
        if (ret?.sucesso !== false) {
            loadedForUserIdRef.current = null;
            setBuyer({ name: "", email: "", phone: "", cpf: "" });
        }
    };

    const showError = (msg: string) => {
        setToastDialog(MessageToastEnum.Error);
        setToastMsg(msg);
        setToastShow(true);
    };

    const showInfo = (msg: string) => {
        setToastDialog(MessageToastEnum.Information);
        setToastMsg(msg);
        setToastShow(true);
    };

    // Bootstrap: network → seller → product. Bail out early at each missing
    // step with a dedicated state so the UI can show a meaningful empty
    // surface instead of a generic 404.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!networkSlug || !sellerSlug || !productSlug) {
                setPageState("network_not_found");
                return;
            }
            setPageState("loading");

            const netRet = await networkContext.getBySlug(networkSlug);
            if (cancelled) return;
            if (!netRet.sucesso || !netRet.network) {
                setPageState("network_not_found");
                return;
            }

            const sellerRet = await networkContext.getSellerBySlug(networkSlug, sellerSlug);
            if (cancelled) return;
            if (!sellerRet.sucesso) {
                setPageState("seller_not_found");
                return;
            }

            const productRet = await productContext.getBySlug(productSlug);
            if (cancelled) return;
            if (!productRet.sucesso || !productRet.product) {
                setPageState("product_not_found");
                return;
            }

            const resolvedProduct = productRet.product as StorefrontProductInfo;
            setView({
                network: netRet.network,
                seller: networkContext.seller,
                product: resolvedProduct,
            });

            // Seed `amount`: fixed-price products lock to product.price; open
            // donations seed with the minimum (or 0 for the user to type).
            if (isOpenDonation(resolvedProduct)) {
                setAmount(resolvedProduct.minimumDonationAmount ?? 0);
            } else {
                setAmount(resolvedProduct.price ?? 0);
            }
            setPageState("ready");
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkSlug, sellerSlug, productSlug]);

    const handleSubmit = () => {
        if (!view) return;

        // Boleto / Card are UI stubs — keep the user informed but do not call
        // the backend. TODO: wire these once the corresponding flows exist.
        if (paymentMethod !== "pix") {
            showInfo(t("vendor_product_payment_coming_soon"));
            return;
        }

        const product = view.product;

        // Validate donation amount before processing the inline form.
        if (isOpenDonation(product)) {
            const minimum = product.minimumDonationAmount ?? 0;
            if (!amount || amount <= 0) {
                showError(t("donation_amount_required"));
                return;
            }
            if (minimum > 0 && amount < minimum) {
                showError(t("donation_min_warning", { min: minimum.toFixed(2) }));
                return;
            }
        }

        // Validate inline buyer fields. Name/email are prefilled from the
        // session when logged in (read-only) but still validated for safety.
        const nameTrim = buyer.name.trim();
        const emailTrim = buyer.email.trim();
        const cpfDigits = buyer.cpf.replace(/\D/g, "");
        if (!nameTrim) {
            showError(t("name_required"));
            return;
        }
        if (!emailRegex.test(emailTrim)) {
            showError(t("email_invalid"));
            return;
        }
        if (!isValidCpf(cpfDigits)) {
            showError(t("cpf_invalid"));
            return;
        }

        void finalizeCheckout({
            name: nameTrim,
            email: emailTrim,
            documentId: cpfDigits,
            phone: buyer.phone.replace(/\D/g, ""),
        });
    };

    const finalizeCheckout = async (buyerData: {
        name: string;
        email: string;
        documentId: string;
        phone: string;
    }) => {
        if (!view) return;
        setSubmitting(true);
        // For donations (open or fixed) we forward the buyer-typed/seed
        // `amount` so backend can override product.Price. Fixed-price products
        // pass undefined and backend keeps using product.Price.
        const overrideAmount = isDonation(view.product) ? amount : undefined;
        const ret = await orderContext.createPixPayment(
            view.product.slug,
            buyerData.documentId,
            buyerData.phone,
            networkSlug,
            sellerSlug,
            overrideAmount,
        );
        setSubmitting(false);
        if (!ret.sucesso) {
            showError(ret.mensagemErro || t("storefront_action_error"));
            return;
        }
        setPixCustomer({
            name: buyerData.name,
            email: buyerData.email,
            documentId: buyerData.documentId,
            cellphone: buyerData.phone,
        });
        setPixOpen(true);
    };

    const Template = useMemo(
        () => resolveTemplate(view?.network?.template ?? null),
        [view?.network?.template],
    );

    const renderEmpty = (title: string) => (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                background: "#F4F1EA",
                color: "#1A1812",
                fontFamily: "Inter, system-ui, sans-serif",
                textAlign: "center",
            }}
        >
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>{title}</h1>
                <p style={{ color: "#5A574F", margin: 0 }}>{t("vendor_product_unavailable_help")}</p>
            </div>
        </div>
    );

    if (pageState === "loading") {
        return (
            <>
                <VendorProductSkeleton />
                <VendorFooter />
            </>
        );
    }

    if (pageState === "network_not_found") {
        return (
            <>
                {renderEmpty(t("storefront_unavailable"))}
                <VendorFooter />
            </>
        );
    }
    if (pageState === "seller_not_found") {
        return (
            <>
                {renderEmpty(t("storefront_seller_not_found"))}
                <VendorFooter />
            </>
        );
    }
    if (pageState === "product_not_found" || !view) {
        return (
            <>
                {renderEmpty(t("vendor_product_not_found"))}
                <VendorFooter />
            </>
        );
    }

    return (
        <>
            <MessageToast
                dialog={toastDialog}
                showMessage={toastShow}
                messageText={toastMsg}
                onClose={() => setToastShow(false)}
            />

            <Template
                view={view}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                amount={amount}
                onAmountChange={isOpenDonation(view.product) ? setAmount : undefined}
                submitting={submitting}
                onSubmit={handleSubmit}
                buyer={buyer}
                onBuyerChange={patchBuyer}
                isLoggedIn={isLoggedIn}
                onOpenLogin={() => setLoginOpen(true)}
                onLogout={handleLogout}
            />

            <VendorFooter />

            <LoginPasswordModal
                show={loginOpen}
                onClose={() => setLoginOpen(false)}
                onSuccess={() => setLoginOpen(false)}
                initialEmail={buyer.email}
            />

            {pixCustomer && (
                <PixModalContainer
                    open={pixOpen}
                    onClose={() => setPixOpen(false)}
                    onError={(msg) => showError(msg)}
                    invoiceId={orderContext.pixPaymentResult?.qrCode?.invoiceId ?? null}
                    brCode={orderContext.pixPaymentResult?.qrCode?.brCode ?? ""}
                    brCodeBase64={orderContext.pixPaymentResult?.qrCode?.brCodeBase64 ?? ""}
                    expiredAt={orderContext.pixPaymentResult?.qrCode?.expiredAt}
                    returnUrl={`/${networkSlug}/store/${sellerSlug}`}
                />
            )}
        </>
    );
}
