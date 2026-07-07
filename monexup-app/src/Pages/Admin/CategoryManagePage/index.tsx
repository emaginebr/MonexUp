import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCategory } from "lofn-react";
import type { CategoryInfo } from "lofn-react";

type CategoryItem = CategoryInfo & { parentCategoryId?: number | null };
import {
    ChevronRight,
    Layers,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import Modal from "react-bootstrap/Modal";

import AuthContext from "../../../Contexts/Auth/AuthContext";
import NetworkContext from "../../../Contexts/Network/NetworkContext";
import { UserRoleEnum } from "../../../DTO/Enum/UserRoleEnum";
import { MessageToastEnum } from "../../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../../Components/MessageToast";
import { Skeleton } from "../../../Components/ui/skeleton";
import FormField from "../../NetworkEditPage/FormField";

/**
 * CategoryManagePage — `/admin/categories`.
 *
 * Lofn category CRUD admin surface. Mirrors the ProfileListPage chrome and
 * relies on the Lofn REST endpoints (`POST /category/{slug}/insert`,
 * `POST /category/{slug}/update`, `DELETE /category/{slug}/delete/{id}`).
 *
 * Listing reuses lofn-react's `useCategory().listActive(storeSlug)` (no
 * pagination required for typical small stores).
 *
 * Store-slug resolution mirrors ProductFormPage: lofn-react's
 * `getStoreById` GraphQL helper is stale (Int! vs Long!), so we issue a raw
 * GraphQL `myStores` query with the correct `Long!` variable.
 */
export default function CategoryManagePage() {
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);
    const categoryApi = useCategory();

    const lofnApiUrl = useMemo(
        () => process.env.REACT_APP_LOFN_API_URL || "",
        [],
    );

    const networkId = networkContext?.network?.networkId;
    const lofnStoreId = (networkContext?.network as any)?.lofnStoreId ?? null;
    const token = auth?.sessionInfo?.token ?? "";

    const [storeSlug, setStoreSlug] = useState<string | null>(null);
    const [resolving, setResolving] = useState<boolean>(true);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [showForm, setShowForm] = useState<boolean>(false);
    const [editing, setEditing] = useState<CategoryItem | null>(null);
    const [name, setName] = useState<string>("");
    const [parentCategoryId, setParentCategoryId] = useState<string>("");
    const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);

    const [toastShow, setToastShow] = useState(false);
    const [toastKind, setToastKind] = useState<MessageToastEnum>(MessageToastEnum.Success);
    const [toastMsg, setToastMsg] = useState<string>("");
    const showToast = (kind: MessageToastEnum, msg: string) => {
        setToastKind(kind);
        setToastMsg(msg);
        setToastShow(true);
    };

    // --- Store-slug resolver (raw GraphQL, Long! variable) -----------------
    useEffect(() => {
        if (!lofnStoreId || !lofnApiUrl || !token) {
            setResolving(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setResolving(true);
            try {
                const r = await fetch(`${lofnApiUrl.replace(/\/$/, "")}/graphql/admin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "X-Tenant-Id": "monexup",
                    },
                    body: JSON.stringify({
                        query: `query ($storeId: Long!) {
                            myStores(where: { storeId: { eq: $storeId } }) {
                                items { storeId slug name }
                            }
                        }`,
                        variables: { storeId: Number(lofnStoreId) },
                    }),
                });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const j = await r.json();
                if (j?.errors?.length) throw new Error(j.errors[0].message);
                const slug = j?.data?.myStores?.items?.[0]?.slug;
                if (cancelled) return;
                setStoreSlug(slug ?? null);
            } catch {
                if (cancelled) return;
                showToast(
                    MessageToastEnum.Error,
                    t("admin_lofn_unavailable", "Lofn indisponível, tente novamente."),
                );
            } finally {
                if (!cancelled) setResolving(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [lofnStoreId, lofnApiUrl, token, t]);

    // --- Categories list --------------------------------------------------
    // Uses Lofn's admin GraphQL `myCategories` so we get the manager-scoped
    // list with `productCount`. Filters by the current store via Long-typed
    // variable to match the backend schema.
    const reload = async () => {
        if (!lofnApiUrl || !token || !lofnStoreId) {
            setCategories([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const r = await fetch(`${lofnApiUrl.replace(/\/$/, "")}/graphql/admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-Tenant-Id": "monexup",
                },
                body: JSON.stringify({
                    query: `query ($storeId: Long!, $skip: Int, $take: Int) {
                        myCategories(where: { storeId: { eq: $storeId } }, skip: $skip, take: $take) {
                            items {
                                categoryId
                                name
                                slug
                                productCount
                                storeId
                                parentId
                            }
                            totalCount
                        }
                    }`,
                    variables: { storeId: Number(lofnStoreId), skip: 0, take: 50 },
                }),
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            if (j?.errors?.length) throw new Error(j.errors[0].message);
            const rawItems: any[] = j?.data?.myCategories?.items ?? [];
            // Normalize GraphQL `parentId` → DTO-style `parentCategoryId`.
            const items: CategoryItem[] = rawItems.map((it) => ({
                ...it,
                parentCategoryId: it.parentId ?? null,
            }));
            setCategories(items);
        } catch {
            showToast(
                MessageToastEnum.Error,
                t("admin_lofn_unavailable", "Lofn indisponível, tente novamente."),
            );
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (resolving) return;
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lofnStoreId, resolving]);

    // --- Modal handlers ---------------------------------------------------
    const openCreate = () => {
        setEditing(null);
        setName("");
        setParentCategoryId("");
        setShowForm(true);
    };

    const openEdit = (category: CategoryItem) => {
        setEditing(category);
        setName(category.name ?? "");
        setParentCategoryId(
            category.parentCategoryId != null ? String(category.parentCategoryId) : "",
        );
        setShowForm(true);
    };

    const closeForm = () => {
        if (submitting) return;
        setShowForm(false);
        setEditing(null);
        setName("");
        setParentCategoryId("");
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = name.trim();
        if (!storeSlug) return;
        if (trimmed.length < 2) {
            showToast(
                MessageToastEnum.Error,
                t("admin_category_name_required", "Informe um nome válido."),
            );
            return;
        }
        const parentId = parentCategoryId.trim() ? Number(parentCategoryId) : null;
        setSubmitting(true);
        try {
            if (editing) {
                await categoryApi.update(storeSlug, {
                    categoryId: editing.categoryId,
                    name: trimmed,
                    parentCategoryId: parentId,
                } as any);
                showToast(
                    MessageToastEnum.Success,
                    t("admin_category_updated_success", "Categoria atualizada."),
                );
            } else {
                await categoryApi.insert(storeSlug, {
                    name: trimmed,
                    parentCategoryId: parentId,
                } as any);
                showToast(
                    MessageToastEnum.Success,
                    t("admin_category_created_success", "Categoria criada."),
                );
            }
            setShowForm(false);
            setEditing(null);
            setName("");
            setParentCategoryId("");
            await reload();
        } catch (err: any) {
            showToast(
                MessageToastEnum.Error,
                err?.message ||
                    t("admin_category_save_error", "Falha ao salvar a categoria."),
            );
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget || !storeSlug || !lofnApiUrl) return;
        setSubmitting(true);
        try {
            const r = await fetch(
                `${lofnApiUrl.replace(/\/$/, "")}/category/${storeSlug}/delete/${deleteTarget.categoryId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "X-Tenant-Id": "monexup",
                    },
                },
            );
            if (!r.ok && r.status !== 204) throw new Error(`HTTP ${r.status}`);
            showToast(
                MessageToastEnum.Success,
                t("admin_category_deleted_success", "Categoria excluída."),
            );
            setDeleteTarget(null);
            await reload();
        } catch (err: any) {
            showToast(
                MessageToastEnum.Error,
                err?.message ||
                    t("admin_category_delete_error", "Falha ao excluir a categoria."),
            );
        } finally {
            setSubmitting(false);
        }
    };

    // --- Guards ------------------------------------------------------------
    if (!auth?.sessionInfo) {
        return (
            <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
                <div className="max-w-container mx-auto px-shell pt-6 pb-12">
                    <p className="text-sm text-graphite-700">{t("loading", "Carregando...")}</p>
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

    const isEmpty = !loading && !resolving && categories.length === 0;

    return (
        <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
            <MessageToast
                showMessage={toastShow}
                dialog={toastKind}
                messageText={toastMsg}
                onClose={() => setToastShow(false)}
            />

            <div className="max-w-container mx-auto px-shell pt-6 pb-12">
                {/* 1. Page header band ------------------------------------------ */}
                <section
                    className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
                    aria-labelledby="category-manage-page-title"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <span
                                aria-hidden="true"
                                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
                            />
                            <h1
                                id="category-manage-page-title"
                                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
                            >
                                {t("admin_category_title", "Categorias")}
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
                                <li
                                    aria-current="page"
                                    className="font-medium text-graphite-700 truncate max-w-[14rem]"
                                >
                                    {t("admin_category_title", "Categorias")}
                                </li>
                            </ol>
                        </nav>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={openCreate}
                            disabled={!storeSlug || resolving}
                            className="cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                        >
                            <Plus size={16} aria-hidden="true" />
                            {t("admin_category_new", "Nova categoria")}
                        </button>
                    </div>
                </section>

                {/* 2. List card -------------------------------------------------- */}
                <section
                    aria-label={t("admin_category_title", "Categorias")}
                    className="auth-card relative p-4 sm:p-6 animate-fade-up"
                >
                    <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
                        {!isEmpty && (
                            <div
                                className="hidden md:!grid grid-cols-12 gap-4 px-4 h-11 items-center bg-mnx-neutral-50 border-b border-mnx-neutral-200"
                                role="row"
                            >
                                <div className="col-span-5 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                    {t("admin_product_field_name", "Nome")}
                                </div>
                                <div className="col-span-3 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                    {t("admin_category_slug", "Slug")}
                                </div>
                                <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                    {t("admin_category_product_count", "Produtos")}
                                </div>
                                <div className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500">
                                    <span className="sr-only">
                                        {t("admin_category_actions", "Ações")}
                                    </span>
                                </div>
                            </div>
                        )}

                        {(loading || resolving) && (
                            <div className="divide-y divide-mnx-neutral-100" aria-busy="true">
                                {[0, 1, 2, 3].map((idx) => (
                                    <div
                                        key={idx}
                                        className="px-4 h-14 hidden md:!grid grid-cols-12 items-center gap-4"
                                    >
                                        <Skeleton className="col-span-5 h-4 max-w-[60%]" />
                                        <Skeleton className="col-span-3 h-4 max-w-[40%]" />
                                        <Skeleton className="col-span-2 h-4 ml-auto w-12" />
                                        <Skeleton className="col-span-2 h-4 ml-auto w-16" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {isEmpty && (
                            <div className="px-6 py-14 text-center">
                                <span
                                    className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
                                    aria-hidden="true"
                                >
                                    <Layers size={22} />
                                </span>
                                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                                    {t("admin_category_empty_title", "Nenhuma categoria cadastrada")}
                                </h3>
                                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                                    {t(
                                        "admin_category_empty_body",
                                        "Crie a primeira categoria para organizar seus produtos.",
                                    )}
                                </p>
                                <button
                                    type="button"
                                    onClick={openCreate}
                                    disabled={!storeSlug}
                                    className="cta-primary inline-flex h-10 items-center gap-2 px-5 mt-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} aria-hidden="true" />
                                    {t("admin_category_new", "Nova categoria")}
                                </button>
                            </div>
                        )}

                        {!loading && !resolving && !isEmpty && (
                            <div role="rowgroup">
                                {categories.map((c) => (
                                    <div
                                        key={c.categoryId}
                                        className="hidden md:!grid grid-cols-12 items-center gap-4 px-4 h-14 border-b border-mnx-neutral-100 last:border-b-0 hover:bg-orange-500/5 transition-colors duration-fast"
                                        role="row"
                                    >
                                        <div className="col-span-5 min-w-0">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(c)}
                                                className="text-sm font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast truncate inline-block max-w-full text-left"
                                            >
                                                {c.name || "—"}
                                            </button>
                                        </div>
                                        <div className="col-span-3 text-[12px] text-graphite-500 truncate font-mono">
                                            {c.slug || "—"}
                                        </div>
                                        <div className="col-span-2 text-right text-sm text-graphite-700 mnx-num tabular-nums">
                                            {c.productCount ?? 0}
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(c)}
                                                aria-label={t("admin_category_edit", "Editar categoria")}
                                                title={t("admin_category_edit", "Editar categoria")}
                                                className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                                            >
                                                <Pencil size={16} aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(c)}
                                                aria-label={t("admin_category_delete", "Excluir categoria")}
                                                title={t("admin_category_delete", "Excluir categoria")}
                                                className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-orange-700 hover:bg-orange-500/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                                            >
                                                <Trash2 size={16} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Mobile stacked */}
                                {categories.map((c) => (
                                    <div
                                        key={`m-${c.categoryId}`}
                                        className="md:hidden border-b border-mnx-neutral-100 last:border-b-0 px-4 py-4 hover:bg-orange-500/5 transition-colors duration-fast"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(c)}
                                                className="text-base font-semibold text-graphite-900 hover:text-orange-700 transition-colors duration-fast min-w-0 flex-1 truncate text-left"
                                            >
                                                {c.name || "—"}
                                            </button>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(c)}
                                                    aria-label={t("admin_category_edit", "Editar categoria")}
                                                    className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast"
                                                >
                                                    <Pencil size={16} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(c)}
                                                    aria-label={t("admin_category_delete", "Excluir categoria")}
                                                    className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-orange-700 hover:bg-orange-500/10 transition-colors duration-fast"
                                                >
                                                    <Trash2 size={16} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                        <dl className="mt-3 grid grid-cols-2 gap-3">
                                            <div>
                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                    {t("admin_category_slug", "Slug")}
                                                </dt>
                                                <dd className="mt-0.5 text-sm text-graphite-700 font-mono truncate">
                                                    {c.slug || "—"}
                                                </dd>
                                            </div>
                                            <div className="text-right">
                                                <dt className="text-[0.65rem] uppercase tracking-wider font-semibold text-graphite-400">
                                                    {t("admin_category_product_count", "Produtos")}
                                                </dt>
                                                <dd className="mt-0.5 text-sm text-graphite-900 mnx-num tabular-nums">
                                                    {c.productCount ?? 0}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Create / Edit Modal --------------------------------------- */}
            <Modal show={showForm} onHide={closeForm} centered backdrop="static">
                <Modal.Header className="border-b border-mnx-neutral-200">
                    <Modal.Title className="text-base font-display font-bold text-graphite-900">
                        {editing
                            ? t("admin_category_edit", "Editar categoria")
                            : t("admin_category_new", "Nova categoria")}
                    </Modal.Title>
                    <button
                        type="button"
                        onClick={closeForm}
                        disabled={submitting}
                        className="inline-flex w-9 h-9 items-center justify-center rounded-md text-graphite-500 hover:text-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast disabled:opacity-50"
                        aria-label={t("back_button", "Voltar")}
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </Modal.Header>
                <form onSubmit={handleSubmit}>
                    <Modal.Body className="space-y-4">
                        <FormField
                            id="category-name"
                            label={t("admin_product_field_name", "Nome")}
                            icon={Layers}
                        >
                            <input
                                id="category-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                                maxLength={120}
                                autoFocus
                                className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 placeholder:text-graphite-400 focus:outline-none pr-3"
                            />
                        </FormField>

                        <FormField
                            id="category-parent"
                            label={t("admin_category_parent", "Categoria pai")}
                            icon={Layers}
                        >
                            <select
                                id="category-parent"
                                value={parentCategoryId}
                                onChange={(e) => setParentCategoryId(e.target.value)}
                                className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 focus:outline-none pr-3 appearance-none cursor-pointer"
                            >
                                <option value="">
                                    {t("admin_category_parent_none", "Nenhuma")}
                                </option>
                                {categories
                                    .filter(
                                        (c) =>
                                            !editing || c.categoryId !== editing.categoryId,
                                    )
                                    .map((c) => (
                                        <option key={c.categoryId} value={String(c.categoryId)}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                        </FormField>
                    </Modal.Body>
                    <Modal.Footer className="border-t border-mnx-neutral-200">
                        <button
                            type="button"
                            onClick={closeForm}
                            disabled={submitting}
                            className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast disabled:opacity-50"
                        >
                            {t("back_button", "Voltar")}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="cta-primary inline-flex h-10 items-center gap-2 px-5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                        >
                            {submitting ? t("loading", "Carregando...") : t("save_button", "Salvar")}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* Delete confirm ------------------------------------------- */}
            <Modal
                show={Boolean(deleteTarget)}
                onHide={() => !submitting && setDeleteTarget(null)}
                centered
            >
                <Modal.Header className="border-b border-mnx-neutral-200">
                    <Modal.Title className="text-base font-display font-bold text-graphite-900">
                        {t("admin_category_delete", "Excluir categoria")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-sm text-graphite-700">
                        {t(
                            "admin_category_delete_confirm",
                            "Tem certeza?",
                        )}
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-t border-mnx-neutral-200">
                    <button
                        type="button"
                        onClick={() => setDeleteTarget(null)}
                        disabled={submitting}
                        className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-mnx-neutral-300 text-sm font-semibold text-graphite-700 hover:border-graphite-900 hover:bg-mnx-neutral-100 transition-colors duration-fast disabled:opacity-50"
                    >
                        {t("back_button", "Voltar")}
                    </button>
                    <button
                        type="button"
                        onClick={confirmDelete}
                        disabled={submitting}
                        className="inline-flex h-10 items-center gap-2 px-5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={16} aria-hidden="true" />
                        {t("admin_category_delete", "Excluir categoria")}
                    </button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}
