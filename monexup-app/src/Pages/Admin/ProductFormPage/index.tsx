import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useProduct, useImage, ProductTypeEnum } from "lofn-react";
import type { ProductInfo, ProductInsertInfo, ProductUpdateInfo } from "lofn-react";
import { ArrowLeft, ChevronRight, Save } from "lucide-react";

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
import SimpleForm, { SimpleFormValues } from "./SimpleForm";

/**
 * ProductFormPage — redesigned `/admin/products/new` and
 * `/admin/products/:productId` route.
 *
 * Visual contract: matches the freshly redesigned `ProfileEditPage`
 * (compact page header band with 2px orange accent + `display-headline`
 * + breadcrumb in the `ml-[14px]` slot, single `auth-card` body holding
 * the form, ghost `Voltar` and primary `Salvar` on the right of the page
 * header — no sticky save bar, single document scroll). Rendered inside
 * `LayoutAdmin` so this component does NOT render any page chrome.
 *
 * Behavior preserved 1:1 from the legacy Bootstrap version:
 *   - role gate: NetworkManager / Administrator only
 *   - on edit mode mounts: `productApi.getById(storeSlug, id)` → seeds
 *     `editing`, flips Simple/Advanced based on image count > 1
 *   - submit goes through `handleSimpleSubmit` which:
 *       1) calls `networkContext.ensureLofnStore(networkId)` to lazily
 *          provision the Lofn store on first save
 *       2) ensures a default category exists
 *       3) `insert` or `update` via `useProduct`
 *       4) `useImage().upload(productId, file, 1)` when a file is set
 *       5) `productLinkContext.upsert(...)` on first create to register
 *          the MonexUp ↔ Lofn link
 *   - success / error route through `MessageToast`
 *   - on success → navigate to `/admin/products` after 800ms
 *
 * The page header `Salvar` button drives `SimpleForm`'s native submit by
 * calling `requestSubmit()` on the wrapped `<form>` so the form's own
 * validation pipeline (required, minLength, type=number) keeps working.
 * SimpleForm's own submit/cancel buttons are visually hidden via the
 * `[&_form_button[type=submit]]:hidden` selector on the wrapper.
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

    const [mode, setMode] = useState<ProductFormModeEnum>(ProductFormModeEnum.Simple);
    const [editing, setEditing] = useState<ProductInfo | null>(null);
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

    // Wraps the rendered SimpleForm so the page-header Save button can drive
    // the form's native submit pipeline via `requestSubmit()`.
    const formWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isEdit || !productId || !storeSlug) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const product = await productApi.getById(storeSlug, Number(productId));
                if (cancelled) return;
                setEditing(product);
                const hasAdvancedData = (product.images?.length ?? 0) > 1;
                setAdvancedDataWarning(hasAdvancedData);
                setMode(hasAdvancedData ? ProductFormModeEnum.Advanced : ProductFormModeEnum.Simple);
            } catch {
                showToast(MessageToastEnum.Error, t("admin_lofn_unavailable", "Lofn indisponível, tente novamente."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, productId, storeSlug]);

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
            // Ensure Lofn store exists for this network. Backend lazily
            // provisions the store on demand; if the network already has one,
            // this is effectively a no-op that returns the same lofnStoreId.
            let effectiveStoreSlug = storeSlug;
            let effectiveStoreId = storeId;
            if (!effectiveStoreSlug || !effectiveStoreId) {
                const r = await networkContext.ensureLofnStore(networkId);
                if (!r.sucesso || !r.network?.lofnStoreId) {
                    showToast(
                        MessageToastEnum.Error,
                        (r as any).mensagemErro ||
                            t("admin_product_provision_error", "Falha ao provisionar a loja na Lofn."),
                    );
                    return;
                }
                effectiveStoreId = r.network.lofnStoreId as number;
                effectiveStoreSlug = String(effectiveStoreId);
                // Refresh user-network list so future renders see the
                // populated lofnStoreId everywhere (sidebar, lists, etc).
                await networkContext.listByUser();
            }
            const categoryId = await ensureDefaultCategory(effectiveStoreId, effectiveStoreSlug);
            let saved: ProductInfo;

            if (editing) {
                const update: ProductUpdateInfo = {
                    productId: editing.productId,
                    categoryId: editing.categoryId ?? categoryId,
                    name: values.name,
                    description: values.description,
                    price: values.price,
                    discount: editing.discount ?? 0,
                    frequency: editing.frequency ?? 0,
                    limit: editing.limit ?? 0,
                    status: values.status,
                    productType: editing.productType ?? ProductTypeEnum.Physical,
                    featured: editing.featured ?? false,
                };
                saved = await productApi.update(effectiveStoreSlug!, update);
            } else {
                const insert: ProductInsertInfo = {
                    categoryId,
                    name: values.name,
                    description: values.description,
                    price: values.price,
                    discount: 0,
                    frequency: 0,
                    limit: 0,
                    status: values.status,
                    productType: ProductTypeEnum.Physical,
                    featured: false,
                };
                saved = await productApi.insert(effectiveStoreSlug!, insert);
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

    const handleHeaderSave = () => {
        // Drive the SimpleForm's native submit so its validation pipeline
        // (required fields, minLength, file requirement, etc.) keeps working.
        const form = formWrapperRef.current?.querySelector("form");
        form?.requestSubmit();
    };

    return (
        <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
            <MessageToast
                showMessage={toastShow}
                dialog={toastKind}
                messageText={toastMsg}
                onClose={() => setToastShow(false)}
            />

            <div className="max-w-container mx-auto px-shell pt-6 pb-12">
                {/* 1. Page header band (ProfileEditPage parity) ----------------- */}
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

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/products")}
                            className="inline-flex h-9 items-center gap-2 px-3 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            {t("back_button")}
                        </button>
                        <button
                            type="button"
                            onClick={handleHeaderSave}
                            disabled={submitting || loading}
                            className="cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                        >
                            {submitting ? (
                                t("loading")
                            ) : (
                                <>
                                    <Save size={16} aria-hidden="true" />
                                    {t("save_button")}
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* 2. Form card --------------------------------------------------- */}
                <section
                    aria-label={headlineText}
                    className="auth-card relative p-4 sm:p-6 animate-fade-up"
                >
                    {/* Auxiliary controls row (kept compact, lives inside the card so
                        the page header stays clean). */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <ProductModeToggle mode={mode} onModeChange={setMode} />
                        <NetworkSwitcher />
                    </div>

                    {advancedDataWarning && mode === ProductFormModeEnum.Simple && (
                        <div className="mt-4 text-xs text-orange-700 bg-orange-500/10 ring-1 ring-orange-500/20 rounded-md px-3 py-2">
                            {t(
                                "admin_product_advanced_warning",
                                "Este produto tem dados avançados não editáveis em modo Simples — alterne para Avançado para vê-los.",
                            )}
                        </div>
                    )}

                    <div className="mt-4">
                        {loading ? (
                            <div className="space-y-3" aria-busy="true">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : mode === ProductFormModeEnum.Simple ? (
                            <div
                                ref={formWrapperRef}
                                className="[&_form_button[type=submit]]:hidden [&_form_button[type=button]]:hidden"
                            >
                                <SimpleForm
                                    initial={editing}
                                    onSubmit={handleSimpleSubmit}
                                    onCancel={() => navigate("/admin/products")}
                                    submitting={submitting}
                                />
                            </div>
                        ) : (
                            <div className="text-sm text-graphite-600 bg-mnx-neutral-100 rounded-md px-4 py-3">
                                {t("admin_product_mode_advanced", "Avançado")} — em construção
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
