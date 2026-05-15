import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useProduct, useImage } from "lofn-react";
import type { ProductInfo } from "lofn-react";
import { ChevronRight } from "lucide-react";

import AuthContext from "../../../Contexts/Auth/AuthContext";
import NetworkContext from "../../../Contexts/Network/NetworkContext";
import ProductLinkContext from "../../../Contexts/ProductLink/ProductLinkContext";
import { useStoreScope } from "../../../Hooks/useStoreScope";
import { useDefaultCategory } from "../../../Hooks/useDefaultCategory";
import { ProductFormModeEnum } from "../../../DTO/Enum/ProductFormModeEnum";
import { UserRoleEnum } from "../../../DTO/Enum/UserRoleEnum";
import ProductModeToggle from "../../../Components/Admin/ProductModeToggle";
import NetworkSwitcher from "../../../Components/Admin/NetworkSwitcher";
import MessageToast from "../../../Components/MessageToast";
import { Skeleton } from "../../../Components/ui/skeleton";
import { MessageToastEnum } from "../../../DTO/Enum/MessageToastEnum";
import {
    DonationModeEnum,
    ProductInfoExt,
    ProductInsertInfoExt,
    ProductTypeExtended,
    ProductUpdateInfoExt,
} from "../../../DTO/Lofn/ProductExt";
import SimpleForm, { SimpleFormValues } from "./SimpleForm";

const MODE_STORAGE_KEY = "mnx.productForm.advancedMode";

/**
 * ProductFormPage — `/admin/products/new` and `/admin/products/:productId`.
 *
 * Visual contract: ProfileEditPage parity (compact header band + breadcrumb,
 * single `auth-card` body). Save/Voltar live at the BOTTOM of the form (owned
 * by `SimpleForm`); the page header right slot now hosts the
 * "Modo avançado" checkbox (persisted in localStorage `mnx.productForm.advancedMode`,
 * default `false`).
 *
 * Submit flow (preserved + extended for donations):
 *   1) `networkContext.ensureLofnStore(networkId)` — lazy provision Lofn store
 *   2) `ensureDefaultCategory(storeId, storeSlug)`
 *   3) `productApi.insert/update(storeSlug, payload)` — payload is cast to the
 *      extended Lofn shape (`ProductInsertInfoExt` / `ProductUpdateInfoExt`)
 *      that includes `donationMode` and `minimumDonationAmount`. The Lofn C#
 *      backend already accepts these; the npm `lofn-react` types are stale.
 *   4) `imageApi.upload(productId, file, 1)` when an image was picked
 *   5) `productLinkContext.upsert(...)` on first create — registers the
 *      MonexUp ↔ Lofn link
 *
 * Errors → MessageToast. Success → navigate to `/admin/products` after 800ms.
 */
export default function ProductFormPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { productId } = useParams<{ productId?: string }>();
    const isEdit = Boolean(productId);

    const auth = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const productLinkContext = useContext(ProductLinkContext);
    const productApi = useProduct();
    const imageApi = useImage();
    const { ensureDefaultCategory } = useDefaultCategory();
    const { storeId, storeSlug, isReady, needsProvisioning } = useStoreScope();

    // Mode toggle state — persisted in localStorage. Default = Simple.
    const [mode, setMode] = useState<ProductFormModeEnum>(() => {
        if (typeof window === "undefined") return ProductFormModeEnum.Simple;
        try {
            return window.localStorage.getItem(MODE_STORAGE_KEY) === "1"
                ? ProductFormModeEnum.Advanced
                : ProductFormModeEnum.Simple;
        } catch {
            return ProductFormModeEnum.Simple;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(
                MODE_STORAGE_KEY,
                mode === ProductFormModeEnum.Advanced ? "1" : "0",
            );
        } catch {
            /* swallow — non-essential */
        }
    }, [mode]);

    const [editing, setEditing] = useState<ProductInfoExt | null>(null);
    const [loading, setLoading] = useState<boolean>(isEdit);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [advancedDataWarning, setAdvancedDataWarning] = useState<boolean>(false);

    const [toastShow, setToastShow] = useState(false);
    const [toastKind, setToastKind] = useState<MessageToastEnum>(MessageToastEnum.Success);
    const [toastMsg, setToastMsg] = useState("");
    const showToast = (kind: MessageToastEnum, msg: string) => {
        setToastKind(kind);
        setToastMsg(msg);
        setToastShow(true);
    };

    useEffect(() => {
        if (!isEdit || !productId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                // lofn-react's `productApi.getById` declares the GraphQL
                // variable as `Int!` while the server expects `Long!`. We
                // bypass it with a raw GraphQL request that uses the right
                // type and selects the donation fields too.
                const lofnApiUrl =
                    (typeof process !== "undefined" && (process as any).env?.REACT_APP_LOFN_API_URL)
                    || (import.meta as any).env?.REACT_APP_LOFN_API_URL
                    || (import.meta as any).env?.VITE_LOFN_API_URL
                    || "";
                if (!lofnApiUrl) throw new Error("LOFN_API_URL_MISSING");
                const token = auth.sessionInfo?.token ?? "";
                const r = await fetch(`${lofnApiUrl.replace(/\/$/, "")}/graphql/admin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "X-Tenant-Id": "monexup",
                    },
                    body: JSON.stringify({
                        query: `query ($productId: Long!) {
                            myProducts(where: { productId: { eq: $productId } }) {
                                items {
                                    productId
                                    storeId
                                    categoryId
                                    slug
                                    name
                                    description
                                    price
                                    discount
                                    frequency
                                    limit
                                    status
                                    productType
                                    featured
                                    imageUrl
                                    donationMode
                                    minimumDonationAmount
                                    productImages { imageId imageUrl sortOrder }
                                }
                            }
                        }`,
                        variables: { productId: Number(productId) },
                    }),
                });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const j = await r.json();
                if (j?.errors?.length) throw new Error(j.errors[0].message);
                const item = j?.data?.myProducts?.items?.[0];
                if (!item) throw new Error("PRODUCT_NOT_FOUND");
                // Normalize `productImages` → `images` (matches lofn-react helper).
                if (item.productImages && !item.images) {
                    item.images = item.productImages;
                    delete item.productImages;
                }
                if (cancelled) return;
                setEditing(item as ProductInfoExt);
                const hasAdvancedData = (item.images?.length ?? 0) > 1;
                setAdvancedDataWarning(hasAdvancedData);
            } catch {
                if (cancelled) return;
                showToast(
                    MessageToastEnum.Error,
                    t("admin_lofn_unavailable", "Lofn indisponível, tente novamente."),
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, productId]);

    // -------------------------------------------------------------------
    // Early guards (kept inside the same `mnx-surface-light` shell so they
    // visually belong to the redesigned admin surface, not to Bootstrap).
    // -------------------------------------------------------------------
    if (!auth?.sessionInfo) {
        return (
            <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
                <div className="max-w-container mx-auto px-shell pt-6 pb-12">
                    <p className="text-sm text-graphite-700">
                        {t("loading", "Carregando...")}
                    </p>
                </div>
            </main>
        );
    }

    if (
        networkContext?.currentRole !== UserRoleEnum.NetworkManager &&
        networkContext?.currentRole !== UserRoleEnum.Administrator
    ) {
        return (
            <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
                <div className="max-w-container mx-auto px-shell pt-6 pb-12">
                    <p className="text-sm text-graphite-700">
                        {t(
                            "admin_product_not_authorized",
                            "Você precisa ser gestor da rede para acessar esta área.",
                        )}
                    </p>
                </div>
            </main>
        );
    }

    if (!isReady && !needsProvisioning) {
        return (
            <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
                <div className="max-w-container mx-auto px-shell pt-6 pb-12">
                    <div className="auth-card relative p-4 sm:p-6 animate-fade-up space-y-3">
                        <p className="text-sm text-graphite-700">
                            {t(
                                "admin_product_no_active_network",
                                "Selecione uma rede ativa para gerenciar produtos.",
                            )}
                        </p>
                        <NetworkSwitcher />
                    </div>
                </div>
            </main>
        );
    }

    // -------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------
    const handleSimpleSubmit = async (values: SimpleFormValues) => {
        const networkId = networkContext?.network?.networkId;
        if (!networkId) {
            showToast(
                MessageToastEnum.Error,
                t("admin_product_no_active_network", "Selecione uma rede ativa para gerenciar produtos."),
            );
            return;
        }
        setSubmitting(true);
        try {
            // ALWAYS call ensure-store before saving — backend lazily
            // provisions the Lofn store on demand and returns the existing
            // lofnStoreId on subsequent calls (idempotent). This guarantees
            // the store exists even when the cached network info is stale.
            const r = await networkContext.ensureLofnStore(networkId);
            if (!r.sucesso || !r.network?.lofnStoreId) {
                showToast(
                    MessageToastEnum.Error,
                    (r as any).mensagemErro ||
                        t("admin_product_provision_error", "Falha ao provisionar a loja na Lofn."),
                );
                return;
            }
            const effectiveStoreId = r.network.lofnStoreId as number;
            // Lofn REST endpoints (`/Category/{slug}/insert`, etc.) require the
            // actual store SLUG, not the numeric storeId. The lofn-react
            // `getStoreById` helper has a stale GraphQL query (declares
            // `storeId: Int!` while the server expects `Long!`), so we issue a
            // raw GraphQL request with the correct type instead.
            const lofnApiUrl =
                (typeof process !== "undefined" && (process as any).env?.REACT_APP_LOFN_API_URL)
                || (import.meta as any).env?.REACT_APP_LOFN_API_URL
                || (import.meta as any).env?.VITE_LOFN_API_URL
                || "";
            if (!lofnApiUrl) {
                showToast(
                    MessageToastEnum.Error,
                    t("admin_lofn_unavailable", "Lofn indisponível, tente novamente."),
                );
                return;
            }
            const token = auth.sessionInfo?.token ?? "";
            const gqlResp = await fetch(`${lofnApiUrl.replace(/\/$/, "")}/graphql/admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-Tenant-Id": "monexup",
                },
                body: JSON.stringify({
                    query: `query ($storeId: Long!) {
                        myStores(where: { storeId: { eq: $storeId } }) {
                            items { storeId slug name }
                        }
                    }`,
                    variables: { storeId: effectiveStoreId },
                }),
            });
            const gqlJson = await gqlResp.json();
            const effectiveStoreSlug: string | undefined =
                gqlJson?.data?.myStores?.items?.[0]?.slug;
            if (!effectiveStoreSlug) {
                showToast(
                    MessageToastEnum.Error,
                    t("admin_product_provision_error", "Falha ao provisionar a loja na Lofn."),
                );
                return;
            }
            // Refresh user-network list so future renders see the populated
            // lofnStoreId everywhere (sidebar, lists, etc).
            await networkContext.listByUser();
            const categoryId = await ensureDefaultCategory(effectiveStoreId, effectiveStoreSlug);

            // Donation rules:
            //   - When `productType === Donation` AND `donationMode === Free`,
            //     the Lofn backend ignores `price` (the donor picks); we send
            //     0 so the schema stays satisfied.
            //   - `donationMode` and `minimumDonationAmount` are nulled out for
            //     non-Donation types so the backend doesn't carry stale values.
            const isDonation = values.productType === ProductTypeExtended.Donation;
            const isFreeDonation =
                isDonation && values.donationMode === DonationModeEnum.Free;
            const effectivePrice = isFreeDonation ? 0 : values.price;
            const effectiveDiscount = isDonation ? 0 : values.discount;
            const effectiveDonationMode = isDonation ? values.donationMode : null;
            const effectiveMinimumDonationAmount = isDonation
                ? values.minimumDonationAmount
                : null;

            let saved: ProductInfoExt;

            if (editing) {
                const update: ProductUpdateInfoExt = {
                    productId: editing.productId,
                    categoryId: editing.categoryId ?? categoryId,
                    name: values.name,
                    description: values.description,
                    price: effectivePrice,
                    discount: effectiveDiscount,
                    frequency: editing.frequency ?? 0,
                    limit: editing.limit ?? 0,
                    status: values.status,
                    productType: values.productType as unknown as ProductUpdateInfoExt["productType"],
                    featured: editing.featured ?? false,
                    donationMode: effectiveDonationMode,
                    minimumDonationAmount: effectiveMinimumDonationAmount,
                };
                saved = (await productApi.update(
                    effectiveStoreSlug!,
                    update as any,
                )) as ProductInfoExt;
            } else {
                const insert: ProductInsertInfoExt = {
                    categoryId,
                    name: values.name,
                    description: values.description,
                    price: effectivePrice,
                    discount: effectiveDiscount,
                    frequency: 0,
                    limit: 0,
                    status: values.status,
                    productType: values.productType as unknown as ProductInsertInfoExt["productType"],
                    featured: false,
                    donationMode: effectiveDonationMode,
                    minimumDonationAmount: effectiveMinimumDonationAmount,
                };
                saved = (await productApi.insert(
                    effectiveStoreSlug!,
                    insert as any,
                )) as ProductInfoExt;
            }

            if (values.imageFile && saved?.productId) {
                await imageApi.upload(saved.productId, values.imageFile, 1);
            }

            if (!editing && saved?.productId && networkContext?.network && auth.sessionInfo) {
                const r = await productLinkContext.upsert(
                    saved.productId,
                    networkContext.network.networkId,
                    auth.sessionInfo.userId,
                );
                if (!r.sucesso) {
                    showToast(
                        MessageToastEnum.Error,
                        r.mensagemErro ||
                            t("product_link_error_persisted", "Falha ao registrar o vínculo."),
                    );
                    return;
                }
            }

            showToast(
                MessageToastEnum.Success,
                t("admin_product_saved_success", "Produto salvo com sucesso"),
            );
            setTimeout(() => navigate("/admin/products"), 800);
        } catch (err: any) {
            showToast(
                MessageToastEnum.Error,
                err?.message || t("admin_product_save_error", "Falha ao salvar produto"),
            );
        } finally {
            setSubmitting(false);
        }
    };

    // -------------------------------------------------------------------
    // Derived headline + breadcrumb labels
    // -------------------------------------------------------------------
    const newProductLabel = t("admin_product_new", "Novo produto");
    const headlineText = isEdit
        ? loading
            ? t("loading", "Carregando...")
            : editing?.name && editing.name.trim().length > 0
                ? editing.name
                : newProductLabel
        : newProductLabel;

    const breadcrumbCurrent = isEdit
        ? editing?.name && editing.name.trim().length > 0
            ? editing.name
            : newProductLabel
        : newProductLabel;

    return (
        <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
            <MessageToast
                showMessage={toastShow}
                dialog={toastKind}
                messageText={toastMsg}
                onClose={() => setToastShow(false)}
            />

            <div className="max-w-container mx-auto px-shell pt-6 pb-12">
                {/* 1. Page header band — title + breadcrumb on the left,
                    "Modo avançado" checkbox on the right (Save/Voltar moved to
                    the form bottom). */}
                <section
                    className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
                    aria-labelledby="product-form-page-title"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <span
                                aria-hidden="true"
                                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
                            />
                            <h1
                                id="product-form-page-title"
                                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight truncate max-w-[18rem] sm:max-w-[26rem] lg:max-w-[32rem]"
                            >
                                {headlineText}
                            </h1>
                        </div>
                        <nav aria-label="Breadcrumb" className="mt-2 ml-[14px] text-sm">
                            <ol className="flex items-center gap-1 text-graphite-500">
                                <li>
                                    <Link
                                        to="/admin/dashboard"
                                        className="hover:text-orange-600 transition-colors duration-fast"
                                    >
                                        {t("footer_dashboard")}
                                    </Link>
                                </li>
                                <li aria-hidden="true" className="text-graphite-300">
                                    <ChevronRight size={14} />
                                </li>
                                <li>
                                    <Link
                                        to="/admin/products"
                                        className="hover:text-orange-600 transition-colors duration-fast"
                                    >
                                        {t("products")}
                                    </Link>
                                </li>
                                <li aria-hidden="true" className="text-graphite-300">
                                    <ChevronRight size={14} />
                                </li>
                                <li
                                    aria-current="page"
                                    className="font-medium text-graphite-700 truncate max-w-[14rem]"
                                >
                                    {breadcrumbCurrent}
                                </li>
                            </ol>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <ProductModeToggle mode={mode} onModeChange={setMode} />
                    </div>
                </section>

                {/* 2. Form card -------------------------------------------------- */}
                <section
                    aria-label={headlineText}
                    className="auth-card relative p-4 sm:p-6 animate-fade-up"
                >
                    {advancedDataWarning && mode === ProductFormModeEnum.Simple && (
                        <div className="mb-4 text-xs text-orange-700 bg-orange-500/10 ring-1 ring-orange-500/20 rounded-md px-3 py-2">
                            {t(
                                "admin_product_advanced_warning",
                                "Este produto tem dados avançados não editáveis em modo Simples — alterne para Avançado para vê-los.",
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-3" aria-busy="true">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : mode === ProductFormModeEnum.Simple ? (
                        <SimpleForm
                            initial={editing}
                            onSubmit={handleSimpleSubmit}
                            onCancel={() => navigate("/admin/products")}
                            submitting={submitting}
                        />
                    ) : (
                        <div className="text-sm text-graphite-600 bg-mnx-neutral-100 rounded-md px-4 py-3">
                            {t("admin_product_mode_advanced", "Modo avançado")} — em construção
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

// `ProductInfo` re-export kept for backwards compat with downstream imports.
export type { ProductInfo };
