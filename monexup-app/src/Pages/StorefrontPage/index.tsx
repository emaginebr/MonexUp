/**
 * StorefrontPage — router-aware container for the public vendor storefront
 * LISTING page (route: `/{networkSlug}/store/{sellerSlug}`).
 *
 * Responsibilities:
 *   1. Resolve `network`, `seller` and the paginated product list via the
 *      existing contexts.
 *   2. Pick the visual template by `network.template` through the registry
 *      (`templates/index.ts`). Unknown values fall back to "editorial".
 *   3. Render `VendorFooter` (condensed MonexUp powered-by strip), shared
 *      with `VendorProductPage`. The page is registered outside `<Layout />`
 *      in `App.tsx` so the vendor brand owns the entire chrome.
 *
 * The legacy in-listing checkout flow (`DonationAmountForm`,
 * `SimpleLoginForm`, `PixModalContainer`) lives now in `VendorProductPage`
 * — this listing only navigates to the detail page when a card is clicked.
 */
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import ProductContext from "../../Contexts/Product/ProductContext";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import ProductSearchParam from "../../DTO/Domain/ProductSearchParam";
import VendorFooter from "../VendorProductPage/VendorFooter";
import { resolveTemplate } from "./templates";
import {
    StorefrontPageState,
    StorefrontProductInfo,
    StorefrontViewModel,
} from "./types";

export default function StorefrontPage() {
    const { t } = useTranslation();
    const { networkSlug, sellerSlug } = useParams<{
        networkSlug: string;
        sellerSlug: string;
    }>();

    const networkContext = useContext(NetworkContext);
    const productContext = useContext(ProductContext);

    const [pageState, setPageState] = useState<StorefrontPageState>("loading");
    const [toastShow, setToastShow] = useState<boolean>(false);
    const [toastMsg, setToastMsg] = useState<string>("");

    const showError = useCallback((msg: string) => {
        setToastMsg(msg);
        setToastShow(true);
    }, []);

    // Centralised search so pagination and bootstrap fire the same code path.
    const searchProducts = useCallback(
        async (pageNum: number) => {
            const storeId = (networkContext.network as unknown as { lofnStoreId?: number | null })
                ?.lofnStoreId;
            const param: ProductSearchParam = {
                storeId,
                onlyActive: true,
                pageNum,
            };
            const ret = await productContext.search(param);
            if (!ret.sucesso) {
                showError(ret.mensagemErro || t("storefront_action_error"));
            }
            return ret;
        },
        [networkContext.network, productContext, showError, t],
    );

    // Bootstrap: network → seller → first page. Each missing step lands on a
    // dedicated state so the template can render a meaningful empty surface
    // instead of an empty grid + spinner.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!networkSlug || !sellerSlug) {
                setPageState("unavailable");
                return;
            }
            setPageState("loading");
            const netRet = await networkContext.getBySlug(networkSlug);
            if (cancelled) return;
            if (!netRet.sucesso) {
                setPageState("unavailable");
                return;
            }
            const sellerRet = await networkContext.getSellerBySlug(networkSlug, sellerSlug);
            if (cancelled) return;
            if (!sellerRet.sucesso) {
                setPageState("seller_not_found");
                return;
            }
            await searchProducts(1);
            if (cancelled) return;
            setPageState("ready");
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkSlug, sellerSlug]);

    const Template = useMemo(
        () => resolveTemplate(networkContext.network?.template ?? null),
        [networkContext.network?.template],
    );

    // Project context state into the flat view-model the template consumes.
    const view: StorefrontViewModel = useMemo(() => {
        const result = productContext.searchResult;
        const products = (result?.products ?? []) as StorefrontProductInfo[];
        return {
            network: networkContext.network,
            seller: networkContext.seller,
            products,
            pageNum: result?.pageNum ?? 1,
            pageCount: result?.pageCount ?? 0,
            loading: productContext.loadingSearch,
        };
    }, [
        networkContext.network,
        networkContext.seller,
        productContext.searchResult,
        productContext.loadingSearch,
    ]);

    /* --------------------------------------------------------------------
       Render branches:
       - `unavailable` / `seller_not_found` use a minimal scoped empty card
         (no template — the network record may be missing, so we can't pick
         one safely).
       - `loading` and `ready` both render the chosen Template; the template
         is responsible for rendering its own skeleton/empty state internally
         using `view.loading` + `view.products.length`.
       -------------------------------------------------------------------- */
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
                <p style={{ color: "#5A574F", margin: 0 }}>
                    {t("vendor_product_unavailable_help")}
                </p>
            </div>
        </div>
    );

    if (pageState === "unavailable") {
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

    return (
        <>
            <MessageToast
                dialog={MessageToastEnum.Error}
                showMessage={toastShow}
                messageText={toastMsg}
                onClose={() => setToastShow(false)}
            />

            <Template
                view={view}
                networkSlug={networkSlug || ""}
                sellerSlug={sellerSlug || ""}
                onPageChange={(page) => {
                    void searchProducts(page);
                }}
            />

            <VendorFooter />
        </>
    );
}
